const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')
const scoreField = document.getElementById('score');
const highScoreField = document.getElementById('highScore');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

canvas.addEventListener("touchstart", handleStart, false);

ctx.fillStyle = '#96A537';
ctx.fillRect(0, 0, canvas.width, canvas.height);
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const blockCount = 5;
const blockWidth = screenWidth / blockCount;
const heightCount = Math.floor(screenHeight / blockWidth);


const timestep = 1000 / 60;
const startSpeed = blockWidth*2;
let offset;
let lastFrameTimeMs;
let downSpeed;
let delta = 0;
let score;
let highScore;
let gameOver = false;
let tapToRestart;

const blocks = [];

loadHighScore();
loadPlayerName();
startGame();

function startGame() {
  blocks.length = 0;
  offset = 0;
  lastFrameTimeMs = new Date().getTime();
  downSpeed = startSpeed; // Pixels/sec
  delta = 0;
  gameOver = false;
  score = 0;
  tapToRestart = false;
  mainLoop();
}

function mainLoop() {
	let timestamp = new Date().getTime();
	delta += timestamp - lastFrameTimeMs;
	lastFrameTimeMs = timestamp;
	while (delta >= timestep) {
		update(timestep, blocks);
		delta -= timestep;
	}
  if (gameOver) {
    return;
  }
	drawBlocks(blocks, offset);
  scoreField.innerHTML = "Score: " + score;
  highScoreField.innerHTML = "High score: " + highScore;
	requestAnimationFrame(mainLoop);
}

function update(delta, blocks) {
	offset += delta * downSpeed / 1000;
	while (offset > blockWidth) {
		offset -= blockWidth;
		bumpBlocks(blocks);
		spawnNewRow();
	}
}

function findMaxY(x){
	let maxY = -1;
	for (let b of blocks) {
		if (b.x == x && b.y > maxY) {
			maxY = b.y;
		}
	}
	return maxY;
}

function bumpBlocks(blocks) {
	for (let b of blocks) {
		b.y += 1;
		if (b.y > heightCount) {
			gameOver = true;
		}
	}
	if (gameOver) {
  	maybeSaveHighScore();
  	displaySplash();
  	delay(500).then(() => {tapToRestart = true; displaySplash();});
	}
}

function displaySplash() {
  ctx.font = "50px Arial";
  ctx.fillStyle = '#ECF8A5';
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width/2, canvas.height/2 - 60);
  ctx.fillText("Score: " + score, canvas.width/2, canvas.height/2);
  if (tapToRestart) {
  ctx.font = "30px Arial";
    ctx.fillText("Tap to restart", canvas.width/2, canvas.height/2 + 60);
  }
}

function delay(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

function spawnNewRow() {
  const allY = [0, 1, 2, 3, 4];
  shuffle(allY);
  for(let i=0; i<3; i++) {
    blocks.push({x: allY.pop(), y: 0});
  }
}

function drawBlocks(blocks, offset) {
	ctx.fillStyle = '#96A537';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = '#475300';
	for (let b of blocks) {
		ctx.fillRect(b.x * blockWidth, (b.y - 1)*blockWidth + offset, blockWidth, blockWidth);
	}
}

function handleStart(evt) {
  evt.preventDefault();
  if (!gameOver) {
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
      const x = columnFromCoordinate(touches[i].pageX);
      const y = findMaxY(x);
      blocks.push({x: x, y: y+1});
      checkForFullRows();
  	}
  }
  if (tapToRestart) {
    startGame();
  }
}

function checkForFullRows() {
  const rowCount = {};
  for(let b of blocks) {
    if (rowCount[b.y]) {
      rowCount[b.y]++;
    } else {
      rowCount[b.y] = 1;
    }
    if(rowCount[b.y] == blockCount) {
      clearRow(b.y);
      bumpRows(b.y + 1);
      checkForFullRows();
      downSpeed*=1.01;
      score = Math.floor((downSpeed - startSpeed)*10);
      return;
    }
  }
}

function clearRow(y) {
  for (let i = blocks.length-1; i>=0; i--) {
    if (blocks[i].y == y) {
      blocks.splice(i, 1);
    }
  }
}

function bumpRows(y) {
  for (let b of blocks) {
    if (b.y >= y) {
      b.y --;
    }
  }
}

function columnFromCoordinate(x) {
  return Math.floor(x/blockWidth);
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function loadHighScore() {
  var hs = window.localStorage.getItem('breakHighScore');
  if (hs != null) {
    highScore = hs;
  } else {
    highScore = 0;
  }
}

function loadPlayerName() {
	var pn = window.localStorage.getItem('breakPlayerName');
	if (pn != null) {
		playerName = pn;
	} else {
		playerName = prompt("Please enter your name");
		window.localStorage.setItem('breakPlayerName', playerName);
	}
}

function maybeSaveHighScore() {
  var hs = window.localStorage.getItem('breakHighScore');
  if (hs == null || score > hs) {
    highScore = score;
    window.localStorage.setItem('breakHighScore', highScore);
  }
  postScore();
}

function postScore() {
	if (playerName && score > 0) {
    	xhr = new XMLHttpRequest();
    	xhr.open('GET', 'https://script.google.com/macros/s/AKfycbyJlneAMacRR-dwM5E4Rpalm-OZwaU6NpjZIdh41PPbayMD8rjP/exec' + "?name="+playerName+"&score="+score, true);
		xhr.send();
	}
}

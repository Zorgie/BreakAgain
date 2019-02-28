const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

canvas.addEventListener("touchstart", handleStart, false);

ctx.fillStyle = 'blue';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const blockCount = 5;
const blockWidth = screenWidth / blockCount;
const heightCount = Math.floor(screenHeight / blockWidth);

console.log(heightCount);

let timestep = 1000 / 60;
let offset = 0;
let lastFrameTimeMs = new Date().getTime();
let downSpeed = blockWidth*2; // Pixels/sec
let delta = 0;
let gameOver = false;

const blocks = [{x: 0, y: 0},{x: 2, y: 0},{x: 4, y: 0},{x: 1, y: 1},];
const maxY = {};

mainLoop();

function mainLoop() {
	let timestamp = new Date().getTime();
	delta += timestamp - lastFrameTimeMs;
	lastFrameTimeMs = timestamp;
	while (delta >= timestep) {
		update(timestep, blocks);
		delta -= timestep;
	}
	drawBlocks(blocks, offset);
	if (!gameOver) {
		requestAnimationFrame(mainLoop);
	}
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
			console.log("Game over");
			gameOver = true;
		}
	}
}

function spawnNewRow() {
  const allY = [0, 1, 2, 3, 4];
  shuffle(allY);
  for(let i=0; i<3; i++) {
    blocks.push({x: allY.pop(), y: 0});
  }
}

function drawBlocks(blocks, offset) {
	ctx.fillStyle = 'blue';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = 'red';
	for (let b of blocks) {
		ctx.fillRect(b.x * blockWidth, (b.y - 1)*blockWidth + offset, blockWidth, blockWidth);
	}
}

function handleStart(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;
  for (var i = 0; i < touches.length; i++) {
    const x = columnFromCoordinate(touches[i].pageX);
    const y = findMaxY(x);
    blocks.push({x: x, y: y+1});
    checkForFullRows();
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
      return;
    }
  }
}

function clearRow(y) {
  console.log(blocks.length);
  for (let i = blocks.length-1; i>=0; i--) {
    if (blocks[i].y == y) {
      blocks.splice(i, 1);
    }
  }
  console.log(blocks.length);
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

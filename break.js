class Dom {
	constructor() {
		this.ctx = canvas.getContext('2d')
		this.scoreField = document.getElementById('score');
		this.highScoreField = document.getElementById('highScore');
		this.init();
	}

	init() {
		canvas.width = document.body.clientWidth;
		canvas.height = document.body.clientHeight;
		this.ctx.fillStyle = '#96A537';
		this.ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	drawScore(score) {
  		this.scoreField.innerHTML = "Score: " + score;
	}

	drawHighscore(highscore) {
  		this.highScoreField.innerHTML = "High score: " + highscore;
	}

	drawSplash(score, tapToRestart) {
		this.ctx.font = "50px Arial";
		this.ctx.fillStyle = '#ECF8A5';
		this.ctx.textAlign = "center";
		this.ctx.fillText("Game Over", canvas.width/2, canvas.height/2 - 60);
		this.ctx.fillText("Score: " + score, canvas.width/2, canvas.height/2);
		if (tapToRestart) {
			this.ctx.font = "30px Arial";
			this.ctx.fillText("Tap to restart", canvas.width/2, canvas.height/2 + 60);
		}
	}

	drawBlocks(blocks, offset, blockWidth) {
		this.ctx.fillStyle = '#96A537';
		this.ctx.fillRect(0, 0, canvas.width, canvas.height);
		this.ctx.fillStyle = '#475300';
		for (let b of blocks) {
			this.ctx.fillRect(b.x * blockWidth, (b.y - 1)*blockWidth + offset, blockWidth, blockWidth);
		}
	}
}

class Game {
	constructor(dom) {
		this.dom = dom;
		this.blocks = [];
		this.screenWidth = window.innerWidth;
		this.screenHeight = window.innerHeight;
		this.blockCount = 5;
		this.blockWidth = this.screenWidth / this.blockCount;
		this.heightCount = Math.floor(this.screenHeight / this.blockWidth);
		this.timestep = 1000 / 60;
		this.startSpeed = {
			1: this.blockWidth/3,
			2: this.blockWidth/1.5,
			3: this.blockWidth,
			4: this.blockWidth*2,
			5: this.blockWidth*4,
		}
		canvas.addEventListener("touchstart", this.handleTouch.bind(this), false);
		canvas.addEventListener("mousedown", this.handleMouseClick.bind(this), false);
		this.loadDifficulty();
		this.loadHighScore();
	}

	loadDifficulty() {
		var diff = window.localStorage.getItem('breakDifficulty');
		if (diff != null) {
			this.difficulty = diff;
		} else {
			this.difficulty = 3;
		}
	}

	loadHighScore() {
		var hs = window.localStorage.getItem('breakHighScore');
		if (hs != null) {
			this.highScore = hs;
		} else {
	    	this.highScore = 0;
		}
	}

	startGame() {
		this.blocks.length = 0;
		this.offset = 0;
		this.lastFrameTimeMs = new Date().getTime();
		this.downSpeed = this.startSpeed[this.difficulty]; // Pixels/sec
		this.remainingTimeDelta = 0;
		this.gameOver = false;
		this.score = 0;
		this.tapToRestart = false;
		this.mainLoop();
	}

	mainLoop() {
		let timestamp = new Date().getTime();
		this.remainingTimeDelta += timestamp - this.lastFrameTimeMs;
		this.lastFrameTimeMs = timestamp;
		while (this.remainingTimeDelta >= this.timestep) {
			this.update();
			this.remainingTimeDelta -= this.timestep;
		}
		if (this.gameOver) {
			return;
		}
		dom.drawBlocks(this.blocks, this.offset, this.blockWidth);
	  	dom.drawScore(this.score);
	  	dom.drawHighscore(this.highScore);
		requestAnimationFrame(this.mainLoop.bind(this));
	}

	update() {
		this.offset += this.timestep * this.downSpeed / 1000;
		while (this.offset > this.blockWidth) {
			this.offset -= this.blockWidth;
			this.bumpBlocks();
			this.spawnNewRow();
		}
	}

	spawnNewRow() {
		const allY = [];
		for (let i=0; i<this.blockCount; i++) {
			allY.push(i);
		}
		this.shuffle(allY);
		for(let i=0; i<3; i++) {
			this.blocks.push({x: allY.pop(), y: 0});
		}
	}

	shuffle(a) {
	    var j, x, i;
	    for (i = a.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = a[i];
			a[i] = a[j];
			a[j] = x;
	    }
	    return a;
	}

	bumpBlocks() {
		let failed = false;
		for (let b of this.blocks) {
			b.y += 1;
			if (b.y > this.heightCount) {
				failed = true;
			}
		}
		if (failed) {
			this.endGame();
		}
	}

	endGame() {
		this.gameOver = true;
	  	this.maybeSaveHighScore();
		this.postScore();
	  	dom.drawSplash(this.score);
	  	this.delay(500).then(() => {
	  		this.tapToRestart = true; 
	  		dom.drawSplash(this.score, this.tapToRestart);
	  	});
	}

	delay(delay) {
		return new Promise(resolve => setTimeout(resolve, delay));
	}

	maybeSaveHighScore() {
		var hs = window.localStorage.getItem('breakHighScore');
		if (hs == null || this.score > hs) {
			this.highScore = this.score;
			window.localStorage.setItem('breakHighScore', this.highScore);
		}
	}

	postScore() {
		const playerName = this.loadPlayerName();
		if (playerName && this.score > 0) {
	    	const xhr = new XMLHttpRequest();
	    	xhr.open('GET', 'https://script.google.com/macros/s/AKfycbyJlneAMacRR-dwM5E4Rpalm-OZwaU6NpjZIdh41PPbayMD8rjP/exec' + "?name="+playerName+"&score="+this.score, true);
			xhr.send();
		}
	}

	loadPlayerName() {
		let pn = window.localStorage.getItem('breakPlayerName');
		if (pn != null) {
			return pn;
		} else {
			pn = prompt("Please enter your name");
			if (pn != null) {
				window.localStorage.setItem('breakPlayerName', pn);
			}
			return pn;
		}
		return "";
	}

	handleTouch(evt) {
		evt.preventDefault();
		var touches = evt.changedTouches;
		for (var i = 0; i < touches.length; i++) {
			this.handleClick(touches[i].pageX);
		}
	}

	handleMouseClick(evt) {
		evt.preventDefault();
		this.handleClick(evt.x);	
	}

	handleClick(x) {
		if (!this.gameOver) {
			const col = Math.floor(x/this.blockWidth);
			const row = this.findMaxY(col);
			this.blocks.push({x: col, y: row+1});
			this.checkForFullRows();
		}
		if (this.tapToRestart) {
			this.startGame();
		}
	}

	findMaxY(col){
		let maxY = -1;
		for (let b of this.blocks) {
			if (b.x == col && b.y > maxY) {
				maxY = b.y;
			}
		}
		return maxY;
	}

	checkForFullRows() {
		const rowCount = {};
		for(let b of this.blocks) {
			if (rowCount[b.y]) {
				rowCount[b.y]++;
			} else {
				rowCount[b.y] = 1;
			}
			if(rowCount[b.y] == this.blockCount) {
				this.clearRow(b.y);
				this.bumpRows(b.y + 1);
				this.checkForFullRows();
				const startSpeed = this.startSpeed[this.difficulty];
				this.downSpeed += startSpeed * 0.04;
				this.score += Math.floor(startSpeed * 0.4 * Math.sqrt(Math.sqrt(this.difficulty)));
				return;
			}
	  	}
	}

	clearRow(y) {
		for (let i = this.blocks.length-1; i>=0; i--) {
			if (this.blocks[i].y == y) {
				this.blocks.splice(i, 1);
			}
		}
	}

	bumpRows(y) {
		for (let b of this.blocks) {
			if (b.y >= y) {
				b.y --;
			}
		}
	}
}

const dom = new Dom();
const game = new Game(dom);
game.startGame();

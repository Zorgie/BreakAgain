const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

ctx.fillStyle = '#96A537';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const xhr = new XMLHttpRequest();
const url = "https://script.google.com/macros/s/AKfycbyJlneAMacRR-dwM5E4Rpalm-OZwaU6NpjZIdh41PPbayMD8rjP/exec";
xhr.open("GET", url);
xhr.send();

const difficultyField = document.getElementById('difficulty');
let difficulty = 3;
loadDifficulty();

let init = false;

xhr.onreadystatechange = e => {
	if (xhr.responseText && !init) {
		init = true;
		const scores = JSON.parse(xhr.responseText);
		drawHighscore(scores);
	}
}

function drawHighscore(scores) {
	ctx.font = "70px Arial";
	ctx.fillStyle = '#ECF8A5';
	ctx.textAlign = "center";
	ctx.fillText("High scores", canvas.width/2, 70);
	ctx.font = "50px Arial";
	let offset = 60;
	for (let score of scores) {
		ctx.fillText(score.name + ": " + score.score, canvas.width/2, offset+120);
		offset += 60;
	}
}

function changeName() {
	var pn = window.localStorage.getItem('breakPlayerName');
	let playerName;
	if (pn != null) {
		playerName = prompt("Please enter your name", pn);
	} else {
		playerName = prompt("Please enter your name");
	}
	window.localStorage.setItem('breakPlayerName', playerName);
}

function loadDifficulty() {
	var diff = parseInt(window.localStorage.getItem('breakDifficulty'), 10);
	if (diff != null) {
		difficulty = diff;
	} else {
		difficulty = 3;
	}
	setDifficulty(difficulty);
}

function lowerDifficulty() {
	if (difficulty > 1) {
		setDifficulty(difficulty - 1);
	}
}

function raiseDifficulty() {
	if (difficulty < 5) {
		setDifficulty(difficulty + 1);
	}
}

function setDifficulty(newDiff) {
	difficulty = newDiff;
	window.localStorage.setItem('breakDifficulty', newDiff);	
	difficultyField.innerHTML = "Difficulty: " + newDiff + "/5";
}
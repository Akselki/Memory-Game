const myField = document.getElementById("field");
const mySelection = document.getElementById("selectFieldSize")
const myturn = document.getElementById('turn')
const player = document.getElementById('playerName');
const restart = document.getElementById('restart');
const scorePanel = document.getElementById('scorePanel');
const revealed = document.getElementsByClassName('uncovered')
const highScores = document.getElementById('highScores')
const matches = document.getElementById('matches')

myField.addEventListener("click", onClickCard);
mySelection.addEventListener("change", onSelectFieldSize)
restart.addEventListener("click", resetGame)

//Declaring animal card Array 
let myCardArray;

//Declaring board size variable
let boardClass;

//Declaring turn and match counter variable
let turn = 0;

//Declaring match variable
let match = 0;

//Declaring revealed Cards variable
let revealedCounter = 0;

//Declaring the current set to be played variable
let myCardSet;

let hasTimerStarted = false;

//Declaring highscores object
let highscores = JSON.parse(localStorage.getItem('highscores')) || {};

//Declaring players name variable and asking for name
let playerName = localStorage.getItem("playerName");
if (!playerName) {
	playerName = prompt("Please enter your name");
	localStorage.setItem("playerName", playerName);
}
player.innerHTML = playerName;

//Declaring highscore variable and displaying it 
if (Object.keys(highscores).length) {
	highScores.innerHTML = `<p> Highscores: <br><br> 4x4: ${highscores.board4 || '-'} <br><br> 5x5: ${highscores.board5 || '-'}<br><br> 6x6: ${highscores.board6 || '-'}</p>`;
}

fetch("js/cards.json")
	.then(response => response.json())
	.then(data => {
		myCardArray = data.map(card => new Card(card));
	});


class Card {
	constructor(cardObject) {
		this.card1 = cardObject.card1;
		this.card2 = cardObject.card2;
		this.set = cardObject.set;
		this.sound = cardObject.sound;
	}
}

// Creates field based on users selection.
function onSelectFieldSize(mySelection) {
	scorePanel.style.visibility = "visible"

	let fieldSize = mySelection.target.value;
	let myCustomCardArray = shuffle(myCardArray);
	switch (fieldSize) {
		case "4":
			boardClass = "board4";
			myCustomCardArray = myCardArray.slice(0, 8);
			break;
		case "5":
			boardClass = "board5";
			myCustomCardArray = myCardArray.slice(0, 12);
			break;
		case "6":
			boardClass = "board6";
			myCustomCardArray = myCardArray.slice(0, 18);
			break;
	}
	myCardSet = myCustomCardArray;
	myCardSet = myCardSet.concat(myCustomCardArray);
	myCardSet = shuffle(myCardSet);
	populateField(myCardSet);
}

function shuffle(array) {
	var m = array.length,
		t, i;
	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);
		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}

// Creates Field of card elements
function populateField(myCardSet) {
	myField.innerHTML = "";
	myCardSet.forEach(card => {
		let newTile = document.createElement("div");
		let newCard = document.createElement("img");
		let cover = document.createElement("img");
		newTile.setAttribute("class", boardClass);
		let imageURL = "img/" + card.card1 + ".jpg";
		cover.setAttribute("src", "img/cover.png");
		cover.setAttribute("class", "covered");
		newCard.setAttribute("src", imageURL);
		newCard.setAttribute("name", card.card1);
		newTile.appendChild(newCard);
		newTile.appendChild(cover);
		myField.appendChild(newTile);
	});
}

//Uncovers Card and logs bottom card.
function onClickCard(x) {
	if (!hasTimerStarted && turn === 0) {
		hasTimerStarted = true;
		startTimer()
	}
	if (x.target.className === "covered") {
		x.target.className = "uncovered"
		revealedCounter++;
		if (revealedCounter === 2) {
			turn++
			myturn.innerHTML = turn;
			myField.removeEventListener('click', onClickCard);
			evaluateMatch()
			revealedCounter = 0;
		}
	};
}

// Checks to see if turned tiles are the same
function evaluateMatch() {
	if (revealed[0].parentNode.firstChild.name === revealed[1].parentNode.firstChild.name) {
		setTimeout(function () {
			points()
			play(revealed[0].parentNode.firstChild.name)
			revealed[0].parentNode.style.visibility = "hidden";
			revealed[1].parentNode.style.visibility = "hidden";
			//triggers once all tiles have been revealed 
			if (isDone()) {
				scores()
				return;
			}
			reset(revealed);
		}, 1000)
	} else {
		setTimeout(function () {
			reset(revealed);
		}, 1000)
	}
}

//checks if all tiles ahve been flipped
function isDone() {
	const cards = Array.from(document.getElementsByClassName(boardClass));
	const isDone = !cards.filter(card => card.style.visibility != "hidden").length;
	return isDone;
}

//covers tiles if incorrectly chosen
function reset(revealed) {
	revealed[0].className = "covered";
	revealed[0].className = "covered";
	myField.addEventListener("click", onClickCard);
}

//resets game tiles
function resetGame() {
	myCardSet = shuffle(myCardSet);
	populateField(myCardSet);
	turn = 0;
	myturn.innerHTML = turn;
	match = 0;
	matches.innerText = match;
	resetTimer()
}

//plays animal sound
function play(animal) {
	let audio = new Audio(`js/snd/${animal}.wav`);
	audio.play();
}

let second = 0,
	minute = 0,
	hour = 0;
let timer = document.getElementById("timer");
let interval;

function startTimer() {
	interval = setInterval(function () {
		timer.innerHTML = minute + " mins " + second + " secs";
		second++;
		if (second == 60) {
			minute++;
			second = 0;
		}
		if (minute == 60) {
			hour++;
			minute = 0;
		}
	}, 1000);
}

function resetTimer() {
	hasTimerStarted = false;
	second = 0;
	minute = 0;
	hour = 0;
	timer.innerHTML = minute + " mins " + second + " secs";
	clearInterval(interval)
}

//adds the high scroes to local storage as an object
function scores() {
	if (turn < highscores[boardClass] || !highscores[boardClass]) {
		highscores[boardClass] = turn;
		localStorage.setItem('highscores', JSON.stringify(highscores))
	}
	alert(`Congradulations, you finished in ${turn} turns!`)
	location.reload();
}

function points() {
	match++
	matches.innerHTML = match;
}
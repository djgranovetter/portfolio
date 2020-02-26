// © 2020 Daniel Granovetter

let wordSearch = {
	saved: "",
	cols: 0, rows: 0,
	body: [], cellPositions: [], leftovers: [],
	arrange: function(cols, rows) {
		// Here we set up an empty word search
		
		this.cols = cols, this.rows = rows;
		let cells = cols * rows;
		for (let i = 0; i < cells; i ++) this.body[i] = "empty";
		for (let i = 0; i < cells; i ++) this.cellPositions[i] = "empty";
	},
	getCell: function(x, y) {
		// return exact cell number in word search array
		
		let whichCell = y * this.cols + x;
		return whichCell;
	},
	getXY: function(cell) {
		// return word search XY cell
		
		let x = cell % this.cols;
		let y = Math.floor(cell / this.cols);
		
		return [x, y];
	},
	placeLetter: function(letter, x, y, position) {
		// Place a letter at an xy coordinate within the word search
		
		let whichCell = this.getCell(x, y);
		this.body[whichCell] = letter;
		this.cellPositions[whichCell] = position;
	},
	placeWord: function(word, position, startX, startY) {
		// Place word at certain position within word search
		
		let currentX = startX, currentY = startY;
		let wordArr = word.split("");
		wordArr.forEach((item) => {
			this.placeLetter(item, currentX, currentY, position);
			switch (position) {
				case "horz": currentX ++; break;
				case "vert": currentY ++; break;
				case "slantDown": currentX ++, currentY ++; break;
				case "slantUp": currentX ++, currentY --; break;
			}
		});
	},
	testWord: function(word, position, startX, startY) {
		// Test a potential space for a word to make sure it is clear
		
		let currentX = startX, currentY = startY, currentCell = null, condition = "free", freeSpace = true, intersect = false;
		let wordArr = word.split("");
		wordArr.forEach((item, index) => {
			// Make sure word doesn't extend off line, or coincide with another word
			
			if (condition == "not free") return condition;
			
			currentCell = this.getCell(currentX, currentY);
			
			switch (position) {
				case "horz": freeSpace = currentX < this.cols; break;
				case "vert": freeSpace = currentY < this.rows; break;
				case "slantDown": freeSpace = currentX < this.cols && currentY < this.rows; break;
				case "slantUp": freeSpace = currentX < this.cols && currentY >= 0; break;
			}
			
			if (this.body[currentCell] !== "empty" && this.body[currentCell] !== item) freeSpace = false;
			if (this.body[currentCell] == item && this.cellPositions[currentCell] !== position) condition = "intersect";
			
			if (freeSpace == false) condition = "not free";
			
			switch (position) {
				case "horz": currentX ++; break;
				case "vert": currentY ++; break;
				case "slantDown": currentX ++, currentY ++; break;
				case "slantUp": currentX ++, currentY --; break;
			}
		});
		
		return condition;
	},
	placeWords: function(wordList, slant, backwards) {
		// Place all the words into the word search
		
		if (!Array.isArray(wordList)) return;
		
		let positions = ["horz", "vert"];
		if (slant == true) positions.push("slantDown", "slantUp");
		
		// Determine in which position each word will be
		
		let random = 0;
		let positionList = wordList.map((item) => {
			random = Math.floor(Math.random() * positions.length);
			return positions[random];
		});
		
		// Determine how many words will be backwards
		
		if (backwards == true) {
			wordList = wordList.map((item) => {
				random = Math.floor(Math.random() * 2);
				if (random == 0) item = item.split("").reverse().join("");
				return item;
			});
		}
		
		// Test all available spaces for each word and then place it into word search
		
		let currentWord = "", currentPosition = "", currentStatus = ""; freeSpaces = [], intersects = [], whichList = [], currentSpace = [], chosenSpace = [], noFits = [];
		for (i = 0; i < wordList.length; i ++) {
			currentWord = wordList[i], currentPosition = positionList[i];
			for (j = 0; j < this.body.length; j ++) {
				currentSpace = this.getXY(j);
				currentStatus = this.testWord(currentWord, currentPosition, currentSpace[0], currentSpace[1]);
				if (currentStatus == "free") freeSpaces.push(currentSpace);
				else if (currentStatus == "intersect") intersects.push(currentSpace);
			}
			
			// We want as many intersecting words as possible
			
			if (intersects.length > 0) whichList = intersects;
			else if (freeSpaces.length > 0) whichList = freeSpaces;
			else {
				noFits.push(currentWord);
				continue;
			}
			
			random = Math.floor(Math.random() * whichList.length);
			chosenSpace = whichList[random];
			this.placeWord(currentWord, currentPosition, chosenSpace[0], chosenSpace[1]);
			
			freeSpaces = [], intersects = [];
		}
		
		// List all words that did not make it into word search
		
		wordSearch.leftovers = noFits;
	}
};

function doCanvas(wordList, alphabet, highlight = false, restore = false) {
	if (!wordSearch) return;
	
	// If there is already a word search, remove it
	
	let wordSearchSpace = document.getElementById("word_search_space");
	let container = document.getElementById("container");
	let canvas = null;
	if (container == null) {
		container = document.createElement("div");
		container.setAttribute("id", "container");
		container.style.border = "1px solid #cccccc";
		container.style.overflow = "scroll";
		wordSearchSpace.appendChild(container);
		canvas = document.createElement("canvas");
		container.appendChild(canvas);
		canvas.setAttribute("id", "canvas");
	} else {
		container = document.getElementById("container");
		canvas = document.getElementById("canvas");
	}
	
	let ctx = canvas.getContext("2d");
	
	// Measure out canvas size
	
	ctx.font = "16px Times New Roman";
	
	let wordLength = wordList.map((item) => item.length);
	let maxLetters = Math.max.apply(null, wordLength);
	let index = wordLength.indexOf(maxLetters);
	let longestWord = wordList[index];
	
	let longestWordLength = ctx.measureText(longestWord).width;
	
	let cWidth = Math.round(wordSearch.cols * 24 + 72 + longestWordLength);
	let cHeight = null;
	
	if ((wordList.length * 24) > wordSearch.rows * 24) cHeight = wordList.length * 24;
	else cHeight = wordSearch.rows * 24;
	
	ctx.canvas.width = cWidth;
	ctx.canvas.height = cHeight;
	
	// Create word search table on canvas
	
	ctx.fillStyle = "black";
	ctx.font = "16px Times New Roman";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	
	let x = 12, y = 12;
	if (restore == false) wordSearch.saved = "";
	
	let whichCell = 0;
	for (let i = 0; i < wordSearch.rows; i ++) {
		for (let j = 0; j < wordSearch.cols; j ++) {
			if (wordSearch.body[whichCell] !== "empty") {
				if (highlight == true) {
					ctx.fillStyle = "cyan";
					ctx.fillRect(x - 12, y - 12, 24, 24);
				}
				ctx.fillStyle = "black";
				if (restore == true) ctx.fillText(wordSearch.saved[whichCell], x, y);
				else {
					ctx.fillText(wordSearch.body[whichCell], x, y);
					wordSearch.saved += wordSearch.body[whichCell];
				}
			} else {
				if (restore == true) ctx.fillText(wordSearch.saved[whichCell], x, y);
				else {
					wordSearch.saved += alphabet[Math.floor(Math.random() * alphabet.length)];
					ctx.fillText(wordSearch.saved[wordSearch.saved.length - 1], x, y);
				}
			}
			
			x += 24;
			whichCell ++;
		}
		if (i !== wordSearch.rows - 1) x = 12;
		y += 24;
	}
	
	// Enter word list next to word search table
	
	ctx.fillStyle = "black";
	ctx.font = "16px Arial";
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	
	x += 48, y = 12;
	for (let i = 0; i < wordList.length; i ++) {
		ctx.fillText(wordList[i], x, y);
		y += 24;
	}
	
	// Enable save button
	
	let saveBtn = document.getElementById("save_wordsearch");
	saveBtn.disabled = false;
}

function create(restore = false) {
	page.doProblem("");
	
	let words = document.getElementById("word_list").value.split(/\n/);
	if (words[0] == "") {
		page.doProblem("You didn't enter any words!");
		return;
	}
	
	let x = document.getElementById("x_cells").value;
	let y = document.getElementById("y_cells").value;
	
	if (x == "" || y == "") {
		page.doProblem("Please define size of word search!");
		return;
	} else if (x < 10 || y < 10 || x > 30 || y > 30) {
		page.doProblem("The word search size must be a minimum of 10 x 10 and a maximum of 30 x 30!");
		return;
	}
	
	// Determine whether creating new word search or restoring previous one
	
	if (restore == false) wordSearch.arrange(x, y);
	
	words = words.map((item) => item = item.toUpperCase()); // Capitalize each word
	let wordList = words.map((item) => item = item); // clone words array
	
	words = words.map((item) => item.replace(/\s/g, ""));
	let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	
	// Check to make sure word list only contains letters from the alphabet
	
	let allLetters = true;
	words.forEach((item) => {
		if (/[^A-Z]/.test(item) == true) allLetters = false;
	});
	if (allLetters == false) {
		page.doProblem("Please only use English letters.");
		return;
	}
	
	let slantWords = document.getElementById("slant_words").checked;
	let backwardsWords = document.getElementById("backwards_words").checked;
	let highlight = document.getElementById("highlight").checked;
	
	if (restore == false) wordSearch.placeWords(words, slantWords, backwardsWords);
	
	// Make sure words that did not fit into word search are left out
	
	let leftoverWords = wordSearch.leftovers;
	let indexes = [];
	words.forEach((item, index) => {
		if (leftoverWords.includes(item)) indexes.push(index);
	});
	
	wordList = wordList.filter((item, index) => {
		if (!indexes.includes(index)) return item;
	});
	
	doCanvas(wordList, alphabet, highlight, restore);
}

function restore() {
	let wordsearchExists = document.getElementById("container");
	if (wordsearchExists !== null) create(true);
}

function doSave() {
	let canvas = document.getElementById("canvas");
	let img = canvas.toDataURL("image/jpg").replace("image/jpg", "image/octet-stream");
	let imgDownload = document.createElement("a");
	imgDownload.setAttribute("download", "wordsearch.jpg");
	imgDownload.setAttribute("href", img);
	imgDownload.click();
	imgDownload.remove();
}
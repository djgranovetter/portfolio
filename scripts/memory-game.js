// © 2019 Daniel Granovetter

const memoryGame = document.getElementById("memory_game");
const ctx = memoryGame.getContext("2d");

let gameStarted = false, gamePaused = false, soundOn = true;
let titleScreen = null, screenSize = null;

let app = {
	running: false,
	init: function() {
		if (this.running == true) return;
		let contents = document.getElementsByClassName("contents")[0];
		screenSize = window.matchMedia("(min-width: 768px)");
		adjustCanvas();
		memoryGame.style.border = "1px solid black";
		titleScreen = new Image();
		titleScreen.src = "images/title-screen.png";
		titleScreen.onload = () => drawScreen();
		this.running = true;
	},
	resize: function() {
		if (this.running == false) this.init();
		adjustCanvas();
		if (gameStarted == false) drawScreen();
		else layoutCards();
	}
};

memoryGame.onclick = () => {
	if (gameStarted == false) doBtn();
	else if (cards.some((item) => deck[item].matched == false) && gamePaused == false) doCards();
}

class btn {
	constructor(name, x, y, size, btnFunction, btnFamily) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.size = size;
		this.btnFunction = btnFunction;
		this.btnFamily = btnFamily;
	}
}

class setting extends btn {
	constructor(name, family, x, y, size, btnFunction) {
		super(name, x, y, size, btnFunction);
		this.family = family;
	}
}

class card extends btn {
	constructor(name, imgLoc, caption) {
		super(name);
		this.img = new Image;
		this.img.src = imgLoc;
		this.caption = caption;
		this.x = null;
		this.y = null;
		this.size = null;
		this.matched = false;
	}
}
card.prototype.img = new Image;
card.prototype.img.src = "images/card.png";

let btns = {};

let settings = {
	difficulty: {
		name: "Difficulty",
		color: "darkgreen",
		settings: ["Easy", "Medium", "Hard"],
		selected: "Easy",
		sFunction: function(selection) {
			switch (selection) {
				case 0: deckSize = [4, 2]; break;
				case 1: deckSize = [4, 3]; break;
				case 2: deckSize = [5, 4]; break;
				default: return false;
			}
		},
		sColor: "red"
	},
	sound: {
		name: "Sound",
		color: "darkgreen",
		settings: ["On", "Off"],
		selected: "On",
		sFunction: function(selection) {
			switch (selection) {
				case 0: soundOn = true; break;
				case 1: soundOn = false; break;
				default: return false;
			}
		},
		sColor: "red"
	}
};

let deck = {
	java_0: new card("java", "images/java.png", "Java"), java_1: new card("java", "images/java.png", "Java"),
	python_0: new card("python", "images/python.png", "Python"), python_1: new card("python", "images/python.png", "Python"),
	javascript_0: new card("javascript", "images/javascript.png", "JavaScript"), javascript_1: new card("javascript", "images/javascript.png", "JavaScript"),
	php_0: new card("php", "images/php.png", "PHP"), php_1: new card("php", "images/php.png", "PHP"),
	cplus_0: new card("cplus", "images/c++.png", "C++"), cplus_1: new card("cplus", "images/c++.png", "C++"),
	ruby_0: new card("ruby", "images/ruby.png", "Ruby"), ruby_1: new card("ruby", "images/ruby.png", "Ruby"),
	perl_0: new card("perl", "images/perl.png", "Perl"), perl_1: new card("perl", "images/perl.png", "Perl"),
	basic_0: new card ("basic", "images/visual-basic.png", "Visual Basic"), basic_1: new card("basic", "images/visual-basic.png", "Visual Basic"),
	csharp_0: new card ("csharp", "images/c-sharp.png", "C#"), csharp_1: new card ("csharp", "images/c-sharp.png", "C#"),
	sql_0: new card ("sql", "images/sql.png", "SQL"), sql_1: new card ("sql", "images/sql.png", "SQL")
};

let soundEffects = {
	flipCard: new Audio("sounds/flip-card.wav"),
	success: new Audio("sounds/success.wav"),
	youWin: new Audio("sounds/you-win.wav")
};

let cards = [], deckSize = [4, 2];;
let cardsFlipped = new Set;

function position(p, f = 100) {
	let whichPosition = null;
	if (p == "w") whichPosition = memoryGame.width;
	if (p == "h") whichPosition = memoryGame.height;
	f /= 100;
	whichPosition *= f;
	return Math.round(whichPosition);
}

function drawScreen() {
	if (gameStarted !== false) gameStarted = false;
	ctx.clearRect(0, 0, position("w"), position("h"));
	ctx.drawImage(titleScreen, 0, 0, position("w"), position("h"));
	let homeBtns = {
		name: "homescreen",
		btnList: {
			play: ["Play", {x: position("w", 25), y: position("h", 88)}, {w: position("w", 32), h: position("w", 8)}, "yellow", "Arial", "shadow", {f: gameStart, p: []} ],
			settings: ["Settings", {x: position("w", 75), y: position("h", 88)}, {w: position("w", 32), h: position("w", 8)}, "yellow", "Arial", "shadow", {f: displaySettings, p: [settings, "#ffd11a"]} ]
		}
	}
	displayButtons(homeBtns);
}

function adjustCanvas() {
	let contents = document.getElementsByClassName("contents")[0];
	if (screenSize.matches) memoryGame.width = 0.75 * contents.clientWidth;
	else memoryGame.width = 0.90 * contents.clientWidth;
	memoryGame.height = 0.75 * memoryGame.width;
}

function doBtn() {
	let btnList = Object.keys(btns);
	for (let i = 0; i < btnList.length; i ++) {
		if (mouseLoc(btns[btnList[i] ], memoryGame, event)) {
			let whichBtn = btns[btnList[i] ];
			whichBtn.btnFunction();
			if (whichBtn.btnFamily !== undefined) {
				if (whichBtn.btnFamily.radioStyle !== undefined && whichBtn.btnFamily.radioStyle == true) {
					settings[whichBtn.btnFamily.name.toLowerCase()].selected = whichBtn.name;
					drawScreen();
					displaySettings(settings, "#ffd11a");
				}
			}
			return;
		}
	}
}

function gameStart() {
	gameStarted = true;
	gamePaushed = false;
	pickCards(Object.keys(deck));
	cards.sort((a, b) => 0.5 - Math.random());
	layoutCards();
}

function pickCards(whichCards) {
	let counter = 0;
	for (let i in deck) {
		deck[Object.keys(deck)[counter] ].matched = false;
		counter ++;
	}
	let picks = whichCards.map((item) => {
		let whichCard = item.split("_");
		return whichCard[0];
	});
	let pairs = new Set(picks);
	picks = Array.from(pairs);
	picks.sort((a, b) => 0.5 - Math.random());
	let numberCards = 0.5 * (deckSize[0] * deckSize[1]);
	for (let i = 0; i < numberCards; i ++) {
		cards.push(picks[i] + "_" + "0");
		cards.push(picks[i] + "_" + "1");
	}
}

function layoutCards() {
	ctx.fillStyle = "limegreen";
	ctx.fillRect(0, 0, memoryGame.width, memoryGame.height);
	let freeSpace = {};
	let cardWidth = null;
	if (deckSize == [4, 2]) cardWidth = 0.80;
	else if (deckSize == [4, 3]) cardWidth = 0.72;
	else cardWidth = 0.64;
	card.prototype.width = Math.round(cardWidth * (memoryGame.width / deckSize[0]));
	card.prototype.height = Math.round(1.40 * card.prototype.width);
	freeSpace.x = Math.round(memoryGame.width - (card.prototype.width * deckSize[0]));
	freeSpace.y = Math.round(memoryGame.height - (card.prototype.height * deckSize[1]));
	let x = null, y = null;
	for (let i = 0; i < cards.length; i ++) {
		if (i == 0) {
			x = Math.round(freeSpace.x / (deckSize[0] + 1));
			y = Math.round(freeSpace.y / (deckSize[1] + 1));
		} else if (i % deckSize[0] == 0) {
			x = Math.round(freeSpace.x / (deckSize[0] + 1));
			y += Math.round(card.prototype.height + freeSpace.y / (deckSize[1] + 1));
		} else x += Math.round(card.prototype.width + freeSpace.x / (deckSize[0] + 1));
		if (deck[cards[i] ].matched !== true) {
			ctx.drawImage(card.prototype.img, x, y, deck[ cards[i] ].width, deck[ cards[i] ].height);
			deck[cards[i] ].x = x;
			deck[cards[i] ].y = y;
			deck[cards[i] ].size = [deck[ cards[i] ].width, deck[ cards[i] ].height];
		}
	}
	gamePaused = false;
}

function doCards() {
	for (let i = 0; i < cards.length; i ++) {
		if (mouseLoc(deck[cards[i] ], memoryGame, event) && deck[cards[i] ].matched == false) {
			if (cardsFlipped.size > 1) return;
			if (soundOn == true) soundEffects.flipCard.play();
			let x = deck[cards[i] ].x;
			let y = deck[cards[i] ].y;
			ctx.drawImage(deck[cards[i] ].img, x, y, deck[cards[i] ].width, deck[cards[i] ].height);
			cardsFlipped.add(deck[cards[i] ]);
			if (cardsFlipped.size == 2) {
				gamePaused = true;
				setTimeout(() => {
					let pair = Array.from(cardsFlipped);
					if (pair[0].name == pair[1].name) {
						deck[pair[0].name + "_" + "0"].matched = true;
						deck[pair[1].name + "_" + "1"].matched = true;
						if (soundOn == true) soundEffects.success.play();
						ctx.fillStyle = "limegreen";
						ctx.fillRect(0, 0, memoryGame.width, memoryGame.height);
						let cardCaption = deck[cards[i] ].caption + "!";
						cardCaption = strToArr(cardCaption, 10);
						displayText(cardCaption, "auto", "auto", "Arial", "outline", position("w", 10), "center", "purple");
						setTimeout(() => {
							if (cards.every((item) => deck[item].matched == true)) victory();
							else layoutCards();
						}, 1000);
					} else {
						layoutCards();
					}
					cardsFlipped.clear();
				}, 1000);
			}
			return;
		}
	}
}

function victory() {
	if (soundOn == true) soundEffects.youWin.play();
	cards = [];
	ctx.fillStyle = "limegreen";
	ctx.fillRect(0, 0, memoryGame.width, memoryGame.height);
	displayText(["Hooray!", "You win!"], "auto", "auto", "Arial", "outline", position("w", 10), "center", "red");
	setTimeout(drawScreen, 2000);
}

function mouseLoc(obj, canvas, event) {
	if (obj == null) return false;
	let canvasRect = canvas.getBoundingClientRect();
	let x = event.clientX - canvasRect.left;
	let y = event.clientY - canvasRect.top;
	if (x >= obj.x && x <= obj.x + obj.size[0] && y >= obj.y && y <= obj.y + obj.size[1]) {
		return true;
	} else {
		return false;
	}
}

function displayText(txtArr, txtX, txtY, txtFont, txtStyle, txtSize, txtAlign, txtColor) {
	if (!Array.isArray(txtArr) || !ctx) return;
	if (txtX == "auto") txtX = position("w", 50);
	if (txtY == "auto") {
		let txtPosition = 50;
		if (txtArr.length > 1) txtPosition -= txtArr.length * 5;
		txtY = position("h", txtPosition);
	}
	if (txtStyle !== "outline") ctx.font = txtStyle + " " + txtSize + "px " + txtFont;
	else {
		ctx.font = "bold " + txtSize + "px " + txtFont;
		ctx.strokeStyle = "black";
		ctx.miterLimit = 1;
	}
	ctx.textAlign = txtAlign;
	ctx.textBaseline = "middle";
	ctx.lineWidth = Math.round(0.10 * txtSize);
	ctx.fillStyle = txtColor;
	txtArr.forEach((item) => {
		if (txtStyle == "outline") ctx.strokeText(item, txtX, txtY);
		ctx.fillText(item, txtX, txtY);
		txtY += txtSize * 1.2;
	});
	if (ctx.miterLimit !== 10) ctx.miterLimit = 10;
}

function displayButton(name, loc, size, color, font, style, btnFunction, btnFamily) {
	let styles = ["default", "rectangle", "shadow", "transparent"];
	if (!ctx || !btns || !styles.includes(style)) return;
	let txtSize = (size.w / size.h) * position("w", 1);
	ctx.font = "bold " + txtSize + "px " + font;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	let btnWidth = null;
	if (btnFamily == undefined || btnFamily["size"] == undefined) btnWidth = ctx.measureText(name).width + 16;
	else btnWidth = ctx.measureText(btnFamily["size"]).width + 16;
	let btnHeight = txtSize + 16;
	ctx.strokeStyle = "black";
	ctx.lineWidth = position("w", 0.5);
	if (style == "shadow") {
		ctx.fillStyle = "black";
		ctx.strokeRect(Math.round(loc.x - btnWidth / 2 + 2), Math.round(loc.y - btnHeight / 2 + 2), btnWidth, btnHeight);
		ctx.fillRect(Math.round(loc.x - btnWidth / 2 + 2), Math.round(loc.y - btnHeight / 2 + 2), btnWidth, btnHeight);
	}
	if (style !== "transparent") {
		ctx.fillStyle = color;
		ctx.strokeRect(Math.round(loc.x - btnWidth / 2), Math.round(loc.y - btnHeight / 2), btnWidth, btnHeight);
		ctx.fillRect(Math.round(loc.x - btnWidth / 2), Math.round(loc.y - btnHeight / 2), btnWidth, btnHeight);
		ctx.fillStyle = "black";
	} else ctx.fillStyle = color;
	ctx.fillText(name, loc.x, loc.y);
	btns[name] = new btn(name, Math.round(loc.x - btnWidth / 2), Math.round(loc.y - btnHeight / 2), [btnWidth, btnHeight], () => btnFunction.f(...btnFunction.p), btnFamily);
}

function displayButtons(obj) {
	let btnList = Object.values(obj.btnList);
	let charCount = btnList.map((item) => item[0].length);
	let maxChars = Math.max.apply(null, charCount);
	let maxCharIndex = charCount.reduce((total, item, index) => {
		if (item == maxChars) total = index;
		return total;
	});
	btnList.forEach((item, index) => displayButton(...item, {name: obj.name, size: btnList[maxCharIndex][0], radioStyle: false}));
}

function displaySettings(obj, bkgndColor) {
	if (!ctx) return;
	let objItems = Object.keys(obj);
	
	// Check how big we need to make our box
	
	let settingsList = objItems.reduce((total, item) => {
		total.push(obj[item].settings.join(" "));
		return total;
	}, []);
	let charCount = settingsList.map((item) => item.length);
	let maxChars = Math.max.apply(null, charCount);
	
	// draw box
	
	let sw = Math.round(memoryGame.width / 2 + maxChars * 10);
	let sh = Math.round(memoryGame.height / 2 + settingsList.length * 15);
	let sx = Math.round(memoryGame.width / 2 - sw / 2);
	let sy = Math.round(memoryGame.height / 2 - sh / 2);
	
	ctx.lineWidth = position("w", 0.5);
	ctx.strokeStyle = "black";
	ctx.fillStyle = shadeColor(bkgndColor, -40);
	ctx.strokeRect(sx, sy, sw, sh);
	ctx.fillRect(sx, sy, sw, sh);
	ctx.strokeRect(sx + position("w", 1.5), sy + position("w", 1.5), sw - position("w", 3), sh - position("w", 3));
	ctx.fillStyle = bkgndColor;
	ctx.fillRect(sx + position("w", 1.5), sy + position("w", 1.5), sw - position("w", 3), sh - position("w", 3));
	
	// draw settings
	
	displayButton("Done", {x: sx + sw / 2, y: sy + sh}, {w: Math.round(sw * 0.32), h: Math.round(sw * 0.08)}, bkgndColor, "Arial", "default", {f: drawScreen, p: []} );
	
	sx = Math.round(memoryGame.width / 2);
	sy += sh / (objItems.length + 4);
	
	let txtSize = (sw / sh) * position("w", 2.8);
	let spacing = null;
	ctx.font = "bold " + txtSize + "px Times New Roman";
	ctx.textAlign = "center";
	ctx.fillStyle = "black";
	ctx.fillText("Settings", sx, sy);
	
	txtSize = (sw / sh) * position("w", 2.5);
	sy += Math.round((0.90 * sh) / (objItems.length + 3));
	let whichItem = null;
	let whichColor = null;
	for (let i = 0; i < objItems.length; i ++) {
		whichItem = obj[ objItems[i] ];
		spacing = sw / (whichItem.settings.length + 2.4);
		sx = Math.round(memoryGame.width / 2);
		
		ctx.font = "bold " + txtSize + "px Times New Roman";
		ctx.textAlign = "left";
		ctx.fillStyle = "black";
		ctx.fillText(whichItem.name, sx - 0.45 * sw, sy);
		
		sx = Math.round(memoryGame.width / 2 - sw / 2);
		sx += spacing;
		sy += Math.round((0.70 * sh) / (objItems.length + 3));
		for (let j = 0; j < whichItem.settings.length; j ++) {
			spacing = sw / (whichItem.settings.length);
			if (whichItem.settings[j] !== whichItem.selected) whichColor = whichItem.color;
			else whichColor = whichItem.sColor;
			displayButton(whichItem.settings[j], {x: sx, y: sy}, {w: Math.round(sw * 0.25), h: Math.round(sw * 0.05)}, whichColor, "Arial", "transparent", {f: whichItem.sFunction, p: [j]}, {name: whichItem.name, radioStyle: true});
			sx += Math.round(spacing);
		}
		sy += Math.round((0.90 * sh) / (objItems.length + 3));
		
	}
}

function strToArr(str, maxChars) {
	let arr = [];
    let newStr = "";
    let newLine = false;
	for (i = 0; i < str.length + 1; i ++) {
    	if ((newLine == true && str[i] == " ") || (str[i] == " " && str.indexOf(" ", i + 1) == -1 && str.slice(i + 1, str.length).length >= 8) || (i == str.length)) {
        	arr.push(newStr);
            newStr = "";
            newLine = false;
        } else {
        	newStr = newStr + str[i];
            if (newStr.length >= 8) newLine = true;
        }
    }
    return arr;
}


function shadeColor(color, percent) {
	let r = parseInt(color.substring(1, 3), 16);
	let g = parseInt(color.substring(3, 5), 16);
	let b = parseInt(color.substring(5, 7), 16);
	
	r = parseInt(r * (100 + percent) / 100);
	g = parseInt(g * (100 + percent) / 100);
	b = parseInt(b * (100 + percent) / 100);
	
	r = (r < 255) ? r : 255;  
	g = (g < 255) ? g : 255;  
	b = (b < 255) ? b : 255;  

	let rr = ((r.toString(16).length == 1) ? "0" + r.toString(16) : r.toString(16));
	let gg = ((g.toString(16).length == 1) ? "0" + g.toString(16) : g.toString(16));
	let bb = ((b.toString(16).length == 1) ? "0" + b.toString(16) : b.toString(16));

	return "#"+rr+gg+bb;
}
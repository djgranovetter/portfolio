// © 2019 Daniel Granovetter

let canvas = document.getElementById("collage");
let ctx = canvas.getContext("2d");

let canvasImg = [];

let imgPlaced = false, reverseImg = false;
let topText = "", bottomText = "";

let app = {
	init: function() {
		this.resize();
	},
	resize: function() {
		adjustCanvas();
	}
};

function adjustCanvas(whichSize, callback) {
	let canvasSize = document.getElementById("canvas_size");
	let orientation = document.getElementsByName("orientation");
	
	let dimensions = [];
	
	if (whichSize == undefined) {
		let screenSize = window.matchMedia("(min-width: 768px)");
		if (screenSize.matches) dimensions[0] = 480;
		else dimensions[0] = 288;
	} else dimensions[0] = whichSize;
	
	switch (canvas_size.value) {
		case "square": dimensions[1] = dimensions[0]; break;
		case "2x1": dimensions[1] = dimensions[0] * 0.50; break;
		case "3x2": dimensions[1] = dimensions[0] * 0.66; break;
		case "4x3": dimensions[1] = dimensions[0] * 0.75; break;
		case "16x9": dimensions[1] = Math.round(dimensions[0] * 0.56); break;
	}
	
	if (orientation[1].checked) dimensions.reverse();
	
	ctx.canvas.width = dimensions[0], ctx.canvas.height = dimensions[1];
	adjustImg(callback);
}

function create(callback) {
	canvas.style.display = "inline-block";
	page.doProblem("");
	
	let imgFile = document.getElementById("img_file");
	let invalidImg = false;
	let collageSpace = {};
	
	if (imgFile.files[0] !== undefined) {
		let orientation = "", counter = 0, slot = {};

		let doBorder = document.getElementById("do_border");
		
		if (doBorder.checked) collageSpace.space = 0.02 * ctx.canvas.width, collageSpace.width = ctx.canvas.width - collageSpace.space * 2, collageSpace.height = ctx.canvas.height - collageSpace.space * 2;
		else collageSpace.width = ctx.canvas.width, collageSpace.height = ctx.canvas.height, collageSpace.space = 0;

		if (ctx.canvas.width < ctx.canvas.height) orientation = "portrait";
		else orientation = "landscape";

		if (imgFile) {
			let imgList = [];
			
			function processImg() {
				let reader = new FileReader();

				reader.onload = () => {
					canvasImg[counter] = new Image();
					imgList[counter] = reader.result;
					counter++;
					
					if (counter < imgFile.files.length) processImg();
					else {
						canvasImg = Array.from(canvasImg);
						
						if (reverseImg == true) imgList.reverse();
						imgList.forEach((item, index) => {
							canvasImg[index].src = item;
						});
						
						canvasImg[imgFile.files.length - 1].onload = () => drawCollage();
					}
				}

				let prefix = imgFile.files[counter].name.slice(imgFile.files[counter].name.lastIndexOf(".") + 1, imgFile.files[counter].name.length);
				
				if (prefix == "jpg" || prefix == "jpeg" || prefix == "png") reader.readAsDataURL(imgFile.files[counter]);
				else invalidImg = true;
			}

			processImg();

			function drawCollage() {
			
				// Here we create an imaginary table in order to layout the collage on the canvas
				
				let tbl = [], rows = 0, cols = 0;
				switch (canvasImg.length) {
					case 1: tbl.push(1, 1); break;
					case 2: tbl.push(1, 2); break;
					case 3: tbl.push(1, 3); break;
					case 4: tbl.push(2, 2); break;
					case 5: tbl.push(2, 2, 1); break;
					case 6: tbl.push(2, 3); break;
					default:
						page.doProblem("Please upload a maximum of 6 pictures");
						return;
						break;
				}

				if (orientation == "portrait") {
					let foo = tbl[0];
					tbl[0] = tbl[1], tbl[1] = foo;
				}
				rows = tbl[0], cols = tbl[1];
				let divideWidth = collageSpace.width / cols, divideHeight = collageSpace.height / rows;

				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				
				for (let i = 0; i < rows; i++) {
					for (let j = 0; j < cols; j++) {
						slot.x = j * divideWidth + collageSpace.space, slot.y = i * divideHeight + collageSpace.space, slot.width = divideWidth, slot.height = divideHeight;
						if (j !== cols - 1) slot.width -= collageSpace.space;
						if (i !== rows - 1) slot.height -= collageSpace.space;
						if (orientation == "landscape") drawImg(canvasImg[i * rows + j], slot);
						else drawImg(canvasImg[i * cols + j], slot);
					}
				}
				
				if (tbl[2] !== undefined) {
					slot.x = collageSpace.width / 4 + collageSpace.space, slot.y = collageSpace.height / 4 + collageSpace.space, slot.width = divideWidth - collageSpace.space, slot.height = divideHeight - collageSpace.space;
					ctx.clearRect(slot.x - collageSpace.space, slot.y - collageSpace.space, slot.width + collageSpace.space * 2, slot.height + collageSpace.space * 2);
					drawImg(canvasImg[4], slot);
				}
				
				let topText = document.getElementById("top_text"), bottomText = document.getElementById("bottom_text");
				
				if (topText !== "" || bottomText !== "") insertText();
				
				let memeButton = document.getElementById("meme_button");
				let downloadButton = document.getElementById("download_img");
				
				memeButton.disabled = false, downloadButton.disabled = false;
				
				if (callback !== undefined) callback();
			}
		}
		imgPlaced = true;
	} else invalidImg = true, imgPlaced = false;
	
	if (invalidImg == true) page.doProblem("Please select a valid image.");
}

function drawImg(img, slot) {
	
	// Here we draw the image in such a way that it fits into its allotted space without being distorted
	
	if (typeof ctx == "undefined") return;
	
	let foo = null, bar = null, foobar = null, barfoo = null, orientation = {slot: null, img: null};
	
	if (slot.width >= slot.height) foo = (slot.height / slot.width).toFixed(2), orientation.slot = "landscape";
	else foo = (slot.width / slot.height).toFixed(2), orientation.slot = "portrait";
	
	if (img.width >= img.height) bar = (img.height / img.width).toFixed(2), orientation.img = "landscape";
	else bar = (img.width / img.height).toFixed(2), orientation.img = "portrait";

	if (foo == bar && orientation.slot == orientation.img) ctx.drawImage(img, slot.x, slot.y, slot.width, slot.height);
	else if (orientation.slot !== orientation.img) {
		if (orientation.slot == "landscape" && orientation.img == "portrait") {
			foobar = Math.round(0.5 * (img.height - foo * img.width)), barfoo = Math.round(foo * img.width);
			ctx.drawImage(img, 0, foobar, img.width, barfoo, slot.x, slot.y, slot.width, slot.height);
		} else {
			foobar = Math.round(0.5 * (img.width - foo * img.height)), barfoo = Math.round(foo * img.height);
			ctx.drawImage(img, foobar, 0, barfoo, img.height, slot.x, slot.y, slot.width, slot.height);
		}
	} else {
		if (orientation.slot == "landscape") {
			if (foo >= bar) {
				foobar = Math.round(0.5 * (img.width - img.height * (1 / foo))), barfoo = Math.round(img.width - foobar * 2);
				ctx.drawImage(img, foobar, 0, barfoo, img.height, slot.x, slot.y, slot.width, slot.height);
			} else {
				foobar = Math.round(0.5 * (img.height - img.width * foo)), barfoo = Math.round(img.height - foobar * 2);
				ctx.drawImage(img, 0, foobar, img.width, barfoo, slot.x, slot.y, slot.width, slot.height);
			}
		} else {
			if (foo >= bar) {
				foobar = Math.round(0.5 * (img.height - img.width * (1 / foo))), barfoo = Math.round(img.height - foobar * 2);
				ctx.drawImage(img, 0, foobar, img.width, barfoo, slot.x, slot.y, slot.width, slot.height);
			} else {
				foobar = Math.round(0.5 * (img.width - img.height * foo)), barfoo = Math.round(img.width - foobar * 2);
				ctx.drawImage(img, foobar, 0, barfoo, img.height, slot.x, slot.y, slot.width, slot.height);
			}
		}
	}
}

function adjustImg(callback) {
	if (imgPlaced == true) create(callback);
}

function doReverse() {
	if (reverseImg == true) reverseImg = false;
	else reverseImg = true;
	
	create();
}

function doDownload() {
	let collageName = document.getElementById("collage_name").value;
	
	if (checkFileName(collageName) == false) {
		page.doProblem("Invalid name. Please use only letters and numbers, no spaces or special characters.");
		return;
	}
	
	let collageMaker = document.getElementById("collage_maker");
	let newCanvas = document.createElement("canvas");
	
	newCanvas.setAttribute("id", "new_canvas");
	newCanvas.style.display = "none";
	collageMaker.appendChild(newCanvas);
	
	ctx = newCanvas.getContext("2d");
	adjustCanvas(960, downloadImg.bind(null, collageName));
}

function downloadImg(imgName) {
	let imgDownload = document.createElement("a");
	let newCanvas = document.getElementById("new_canvas");
	let img = newCanvas.toDataURL("image/jpg").replace("image/jpg", "image/octet-stream");
	
	imgDownload.setAttribute("download", imgName + ".jpg");
	imgDownload.setAttribute("href", img);
	imgDownload.click();
	imgDownload.remove();
	newCanvas.remove();
	ctx = canvas.getContext("2d");
}

function checkFileName(fname) {
	if (typeof fname !== "string" || fname == "") return false;
	
	fname = fname.toLowerCase();
	
	let validName = true;
	let re = /[a-z]/;
	
	for (let i = 0; i < fname.length; i ++) {
		if (re.test(fname[i]) == false) validName = false;
		if (i == 0) re = /\w|-|_/;
	}
	
	return validName;
}

function doMeme() {
	let meme = document.getElementById("meme");
	meme.style.display = "block";
}

function addText() {
	let textBox = event.target;
	
	if (textBox.id == "top_text") topText = textBox.value.toUpperCase();
	else if (textBox.id == "bottom_text") bottomText = textBox.value.toUpperCase();
	
	let imgFile = document.getElementById("img_file");
	
	if (imgFile.files[0] !== undefined) create();
}

function insertText() {
	let textPosition = {};
	let textMargin = 0.10;
	let canvasSize = document.getElementById("canvas_size");
	
	if (ctx.canvas.width > ctx.canvas.height) {
		if (canvasSize.value == "3x2" || canvasSize.value == "16x9") textMargin += 0.05;
	}
	textPosition.top = textMargin * ctx.canvas.height;
	textPosition.bottom = ctx.canvas.height - (textMargin * ctx.canvas.height);
	
	let textStyle = document.getElementById("text_style");
	let textSize = document.getElementById("text_size");
	let textColor = document.getElementById("text_color");
	
	switch (textColor.value) {
		case "white": textColor = "white"; break;
		case "red": textColor = "#ff4d4d"; break;
		case "green": textColor = "#00ff00"; break;
		case "blue": textColor = "#4db8ff"; break;
		case "orange": textColor = "#ffcc00"; break;
		case "purple": textColor = "#cc99ff"; break;
	}
	
	switch (textSize.value) {
		case "very_large": textSize = 14; break;
		case "large": textSize = 12; break;
		case "medium": textSize = 10; break;
		case "small": textSize = 8; break;
		case "very_small": textSize = 6; break;
	}
	
	if (textStyle.value == "classic_meme") {
		displayText(topText, "auto", textPosition.top, "Arial", "outline", position("w", textSize), "center", textColor);
		displayText(bottomText, "auto", textPosition.bottom, "Arial", "outline", position("w", textSize), "center", textColor);
	} else if (textStyle.value == "comic_text") {
		displayText(topText, "auto", textPosition.top, "Comic", "outline", position("w", textSize), "center", textColor);
		displayText(bottomText, "auto", textPosition.bottom, "Comic", "outline", position("w", textSize), "center", textColor);
	} else {
		displayText(topText, "auto", textPosition.top, "Arial", "", position("w", textSize - 3), "center", textColor);
		displayText(bottomText, "auto", textPosition.bottom, "Arial", "", position("w", textSize - 3), "center", textColor);
	}
}

function position(p, f = 100) {
	var whichPosition = null;
	
	if (p == "w") whichPosition = ctx.canvas.width;
	if (p == "h") whichPosition = ctx.canvas.height;
	
	f /= 100;
	whichPosition *= f;
	
	return Math.round(whichPosition);
}

function displayText(txtStr, txtX, txtY, txtFont, txtStyle, txtSize, txtAlign, txtColor) {
	if (!ctx) return;
	
	if (txtStyle !== "outline") ctx.font = txtStyle + " " + txtSize + "px " + txtFont;
	else {
		ctx.font = "900 " + txtSize + "px " + txtFont;
		ctx.strokeStyle = "black";
		ctx.miterLimit = 1;
	}
	
	ctx.textAlign = txtAlign;
	ctx.textBaseline = "middle";
	ctx.lineWidth = Math.round(0.10 * txtSize);
	ctx.fillStyle = txtColor;
	
	let txtWidth = null;
	let maxWidth = Math.round(0.95 * ctx.canvas.width),
		maxLines = 3,
		wordsPlaced = 0;
	let txtArr = [];
	let tempArr = txtStr.split(" ");
	let tempStr = "";
	let textSize = document.getElementById("text_size");
	let canvasSize = document.getElementById("canvas_size");
	
	if (ctx.canvas.width >= ctx.canvas.height) {
		if (textSize.value == "large" || textSize.value == "very_large") {
			maxLines--;
			if (canvasSize.value !== "square" && canvasSize.value !== "4x3") maxLines--;
		}
	}
	
	for (let i = 0; i < maxLines; i++) {
		for (let j = 0; j < tempArr.length; j++) {
			tempStr += tempArr[j];
			if (j !== tempArr.length - 1) tempStr += " ";
			txtWidth = ctx.measureText(tempStr).width;
			if (txtWidth > maxWidth) {
				tempStr = tempStr.split(" ");
				if (tempStr[tempStr.length - 1] == "") tempStr.splice(tempStr.length - 2, 2);
				else tempStr.pop();
				tempStr = tempStr.join(" ");
				break;
			} else wordsPlaced++;
		}
		tempArr.splice(0, wordsPlaced);
		wordsPlaced = 0;
		txtArr.push(tempStr);
		tempStr = "";
		if (tempArr.length == 0) break;
	}
	
	if (tempArr.length > 0) {
		page.doProblem("Text is too long!");
		return;
	}
	
	if (txtX == "auto") txtX = position("w", 50);
	if (txtY == "auto") {
		let txtPosition = 50;
		if (txtArr.length > 1) txtPosition -= txtArr.length * 5;
		txtY = position("h", txtPosition);
	}
	if (txtY <= position("h", 50)) {
		for (let i = 0; i < txtArr.length; i++) {
			if (txtStyle == "outline") ctx.strokeText(txtArr[i], txtX, txtY);
			ctx.fillText(txtArr[i], txtX, txtY);
			txtY += txtSize * 1.2;
		}
	} else {
		for (let i = txtArr.length; i > 0; i--) {
			if (txtStyle == "outline") ctx.strokeText(txtArr[i - 1], txtX, txtY);
			ctx.fillText(txtArr[i - 1], txtX, txtY);
			txtY -= txtSize * 1.2;
		}
	}
	if (ctx.miterLimit !== 10) ctx.miterLimit = 10;
}
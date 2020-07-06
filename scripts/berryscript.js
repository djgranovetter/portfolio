const dom = {
	grab: function(query, obj = null) {
		let elem = null;
		let queryType = query[0];
		switch (queryType) {
			case "#": elem = document.getElementById(query.replace("#", "")); break;
			case ".": elem = document.getElementsByClassName(query.replace(".", "")); break;
			default: elem = document.getElementsByTagName(query);
		}
		if (obj !== null) this.set(elem, obj);
		return elem;
	},
	create: function(obj) {
		let elem = document.createElement(obj["elem"]);
		this.set(elem, obj);
		return elem;
	},
	set: function(elem, obj) {
		if (obj.txt) {
			if (obj.txt == "empty") elem.innerHTML = "";
			else elem.innerHTML = obj.txt;
		}
		let current = null;
		if (obj.set) {
			let set = obj.set.split(/,\s?(?=\w)/);
			for (let i = 0; i < set.length; i ++) {
				current = set[i].split(/\s?=\s?/);
				elem.setAttribute(current[0], current[1]);
			}
		}
		if (obj.style) {
			let style = obj.style.split(/,\s?(?=\w)/);
			let currentName = null, currentStyle = null;
			let arr = [];
			for (let i = 0; i < style.length; i ++) {
				if (style[i] == "") continue;
				current = style[i].split(/\s?=\s?/);
				currentName = current[0], currentStyle = current[1];
				if (currentName.includes("-")) {
					arr = currentName.split("-");
					arr[1] = arr[1].replace(arr[1][0], arr[1][0].toUpperCase());
					currentName = arr.join("");
				}
				elem.style[currentName] = currentStyle;
			}
		}
	},
	append: function() {
		if (arguments.length < 2) return;
		let currentParent = arguments[arguments.length - 1], currentChild = null;
		for (let i = 0; i < arguments.length; i ++) {
			if (i !== arguments.length - 1) {
				currentChild = arguments[i];
				currentParent.appendChild(currentChild);
			}
		}
	},
	appendChain: function() {
		if (arguments.length < 2) return;
		let currentParent = null, currentChild = null;
		for (let i = 0; i < arguments.length; i ++) {
			if (i !== arguments.length - 1) {
				currentChild = arguments[i], currentParent = arguments[i + 1];
				currentParent.appendChild(currentChild);
			}
		}
	},
	put: function(elem, newElem, where) {
		let sibling = null;
		where == "before" ? sibling = elem : sibling = elem.nextSibling;
		elem.parentNode.insertBefore(newElem, sibling);
	},
	addText: function(elem, txt) {
		elem.innerHTML += txt;
	},
	addBreak: function(elem, breaks = 1) {
		let str = "";
		for (let i = 0; i < breaks; i ++) str += "<br>";
		elem.innerHTML += str;
	},
	subElem: function(whichClass, whichParent, index = null) {
		let counter = 0, obj = {};
		for (let i = 0; i < whichClass.length; i ++) {
			if (whichParent.contains(whichClass[i])) {
				obj[counter] = whichClass[i];
				counter ++;
			}
		}
		if (index == null) return counter;
		else {
			if (!isNaN(index)) return obj[index];
			else if (index == "first") return Object.values(obj)[0];
			else if (index == "last") return Object.values(obj)[Object.values(obj).length - 1];
			else if (index == "all") return Object.values(obj);
			else return false;
		}
	},
	siblingClass: function(elem, position) {
		let whichClass = this.grab("." + elem.className);
		let index = 0;
		for (let i = 0; i < whichClass.length; i ++) {
			if (elem == whichClass[i]) index = i;
		}
		if (position == "prev") return whichClass[index - 1];
		else if (position == "next") return whichClass[index + 1];
		else return false;
	},
	snatch: function() {
		if (arguments.length < 2) return;
		
		let elems = [];
		for (let i = 0; i < arguments.length; i ++) elems[i] = arguments[i];
		
		let childElem = null, parentElem = null, currentElem = null;
		for (let i = 0; i < elems.length; i ++) {
			if (i == elems.length - 1) break;
			childElem = elems[i], parentElem = elems[i + 1];
			for (let j = 0; j < parentElem.children.length; j ++) {
				currentElem = parentElem.children[j];
				if (currentElem !== childElem) currentElem.style.display = "none";
			}
		}
	},
	exclusive: function(elem, ancestor = document.body) {
		for (let i = 0; i < document.body.children.length; i ++) {
			if (elem.parentNode == ancestor) break;
			dom.snatch(elem, elem.parentNode);
		}
	}
};

const msg = {
	x: window.matchMedia("(min-width: 768px)"),
	answer: function(msg, callback = null, affirmative = "Okay") {
		this.openMsg("answer", msg, callback, affirmative);
	},
	ask: function(msg, callback = null, affirmative = "Okay", negative = "Cancel") {
		this.openMsg("ask", msg, callback, affirmative, negative);
	},
	inquire: function(msg, callback = null, affirmative = "Okay", negative = "Cancel") {
		this.openMsg("inquire", msg, callback, affirmative, negative);
	},
	openMsg: function(type, msg, callback, affirmative, negative)  {
		if (event.target.tagName == "BUTTON") event.target.blur();
		
		let overlayExists = dom.grab("#overlay");
		let msgBoxExists = dom.grab("#msg_box");
		
		if (overlayExists !== null) overlayExists.remove();
		if (msgBoxExists !== null) msgBoxExists.remove();
		
		this.doOverlay();
		
		let allOptions = [];
		
		allOptions[0] = affirmative;
		if (type == "ask" || type == "inquire") allOptions[1] = negative;
		
		let widthSettings = "";
		
		if (this.x.matches) widthSettings = "max-width = 25%";
		else widthSettings = "max-width = 90%";
		
		let newMsgBox = dom.create({
			elem: "div",
			set: "id = msg_box",
			style: "position = fixed, top = 33%, left = 50%, transform = translateX(-50%) translateY(-33%), min-width = 240px, height = fit-content, " + 
			"padding = 16px, background-color = white, border = 1px solid, border-radius = 6px, box-shadow = 4px 4px black, font-size = 18px, " +
			"overflow = hidden, z-index = 2, " + widthSettings
		});
		
		let newMsg = dom.create({
			elem: "div",
			style: "margin-bottom = 8px",
			txt: msg
		});
		
		dom.addBreak(newMsg, 1);
		
		let askField = null;
		if (type == "ask") {
			askField = dom.create({
				elem: "input",
				set: "id = ask_field, type = text, maxlength = 48, onchange = msg.getUserInput()",
				style: "width = 100%, padding = 4px, font-size = 16px"
			});
		}
		
		let options = dom.create({
			elem: "div",
			style: "text-align = center"
		});
		
		let newOption = null;
		
		dom.append(newMsg, newMsgBox);
		
		if (askField) dom.append(askField, newMsgBox);
		
		for (let i = allOptions.length; i > 0; i --) {
			let btnAction = "";
			if (callback !== null) btnAction = callback;
			else btnAction = "msg.closeMsg()";
			
			let btnColor = "", primary = "";
			if ((i - 1) == 0) {
				btnColor = "color = white, background-color = green";
				primary = "id = primary_option, ";
			} else btnColor = "color = green, background-color = white";
			
			newOption = dom.create({
				elem: "button",
				set: "type = button, " + primary + "onclick = msg.closeMsg(), " + "onfocus = msg.highlight()",
				style: "min-width = 4em, border = 1px solid black, border-radius = 6px, font-size = 16px, color = black, margin-left = 8px, " +
				"margin-right = 8px, margin-top = 10px, padding = 4px, outline = 0, " + btnColor,
				txt: allOptions[i - 1]
			});
			
			if ((i - 1) == 0) {
				addEventListener("keyup", this.enterKey);
				
				if (type !== "ask") newOption.addEventListener("click", callback);
				else newOption.addEventListener("click", () => {
					callback(this.userInput);
				});
			}
			
			dom.appendChain(newOption, options, newMsgBox);
		}
		
		dom.append(newMsgBox, document.body);
		
		if (askField) askField.focus();
		
		addEventListener("resize", this.doResize);
	},
	enterKey: function() {
		if (event.keyCode == 13) {
			dom.grab("#primary_option").click();
		}
	},
	getUserInput: function() {
		let userInput = dom.grab("#ask_field").value;
		this.userInput = userInput;
	},
	closeMsg: function() {
		dom.grab("#msg_box").remove();
		dom.grab("#overlay").remove();
		
		removeEventListener("keyup", this.enterKey);
		removeEventListener("resize", this.doResize);
	},
	doResize: function() {
		this.x = window.matchMedia("(min-width: 768px)")
		
		let widthSettings = "";
		
		if (this.x.matches) widthSettings = "max-width = 25%";
		else widthSettings = "max-width = 90%";
		
		dom.grab("#msg_box", {
			style: widthSettings
		});
	},
	doOverlay: function() {
		let overlay = dom.create({
			elem: "div",
			set: "id = overlay",
			style: "position = fixed, top = 0, left = 0, right = 0, bottom = 0, width = 100%, height = 100%, background-color = rgba(0,0,0,0.5), " +
			"z-index = 2"
		});
		dom.append(overlay, document.body);
	},
	highlight: function() {
		let btn = event.target;
		let hStyle = "";
		if (btn.id == "primary_option") hStyle = "color = green, background-color = white";
		else hStyle = "color = white, background-color = green"
		dom.set(btn, {
			style: hStyle
		});
	}
};

const ajax = {
	get: function(url, callback, rType = null) {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if (xhr.readyState == 4 && xhr.status == 200) {
				if (callback) callback(xhr.response);
			}
		}
		xhr.open("GET", url, true);
		if (rType !== null) xhr.responseType = rType;
		xhr.send();
	},
	post: function(obj, url, callback) {
		let data = new FormData();
		for (let i in obj) data.append(i, obj[i]);

		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if (xhr.readyState == 4 && xhr.status == 200) {
				if (callback) callback(xhr.response);
			}
		}
		xhr.open("POST", url, true);
		xhr.send(data);
	}
};

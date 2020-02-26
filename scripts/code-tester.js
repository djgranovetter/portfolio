// © 2020 Daniel Granovetter

const codeTester = {
	doCode: function() {
		let code = document.getElementById("code").value.replace(/\n/g, "' + \n'");
		let iframe = document.getElementsByTagName("iframe")[0].contentWindow;
		let iScript = document.createElement("script");
		iScript.innerHTML = "try {eval('" + code + "')} catch(e) {parent.document.getElementById('problem_field').innerHTML = e}";
		iframe.document.body.innerHTML = "";
		page.doProblem("");
		iframe.document.body.appendChild(iScript);
	},
	doSpacing: function() {
		if (event.keyCode == 13) {
			let code = document.getElementById("code");
			let allPrevCode = code.value.substr(0, code.selectionStart).split("\n");
			let currentLine = allPrevCode.length;
			let currentChar = allPrevCode.join("\n").length;
			let prevLine = code.value.split("\n")[currentLine - 1];
			let spaces = 0;
			for (let i = 0; i < prevLine.length; i ++) {
				if (prevLine[i] == " ") spaces ++;
				else break;
			}
			setTimeout(() => {
				allLines = code.value.split("\n");
				for (let i = 0; i < spaces; i ++) allLines[currentLine] += " ";
				let allCode = allLines.join("\n");
				document.getElementById("code").value = allCode;
				this.setCaretPosition(currentChar + spaces + 1);
			}, 10);
		}
	},
	setCaretPosition: function(caretPos) {
		let elem = document.getElementById("code");
		
		if (elem != null) {
			if (elem.createTextRange) {
				let range = elem.createTextRange();
				range.move("character", caretPos);
				range.select();
			} else {
				if (elem.selectionStart) {
					elem.focus();
					elem.setSelectionRange(caretPos, caretPos);
				} else elem.focus();
			}
		}
	}
};
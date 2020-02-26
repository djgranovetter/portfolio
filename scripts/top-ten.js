// © 2020 Daniel Granovetter

let list = [], topTenList = [], choices = [], flow = "";

Array.prototype.pull = function(item) {
	if (!this.includes(item)) {
		this.push(item);
		if (this.length > 1) {
			let temp = this[this.length - 2];
			this[this.length - 2] = item;
			this[this.length - 1] = temp;
		}
	} else {
		let index = this.indexOf(item);
		let prev = index - 1;
		let temp = this[prev];
		this[prev] = item;
		this[index] = temp;
	}
}

function createList() {
	page.doProblem("");
	
	let title = document.getElementsByClassName("title")[0];
	if (title.value == "") {
		page.doProblem("Please give your top ten list a name!");
		return;
	}
	
	let entries = document.getElementsByClassName("entry");
	
	for (let i = 0; i < entries.length; i ++) {
		if (entries[i].value == "") {
			page.doProblem("You must have 10 items to proceed!");
			return;
		}
		list.push(entries[i].value);
	}
	
	list.sort((a, b) => 0.5 - Math.random());
	flow = "downward";
	choices.push(list[0], list[1]);
	
	let startList = document.getElementById("start_list");
	let continueList = document.getElementById("continue_list");
	let results = document.getElementById("results");
	startList.style.display = "none";
	results.style.display = "none";
	continueList.style.display = "block";
	
	let choiceA = document.getElementById("choice_a");
	let choiceB = document.getElementById("choice_b");
	
	let labelA = document.getElementById("label_a");
	let labelB = document.getElementById("label_b");
	
	labelA.innerHTML = list[0];
	labelB.innerHTML = list[1];
}

function makeChoice() {
	let winner = null, loser = null, choice = null;
	
	let choiceA = document.getElementById("choice_a").checked;
	let choiceB = document.getElementById("choice_b").checked;
	
	let labelA = document.getElementById("label_a");
	let labelB = document.getElementById("label_b");
	
	if (choiceA) choice = labelA.innerHTML;
	else if (choiceB) choice = labelB.innerHTML;
	
	if (choice == choices[0]) {
		winner = choices[0], loser = choices[1];
	} else if (choice == choices[1]) {
		winner = choices[1], loser = choices[0];
	}
	
	if (topTenList.length == 0) {
		topTenList.push(winner, loser);
		list.shift();
		list.shift();
	} else if (flow == "downward") {
		if (topTenList[topTenList.length - 1] == winner) {
			topTenList.push(loser);
			list.shift();
		} else if (list[0] == winner) {
			topTenList.pull(winner);
			list.shift();
			flow = "upward";
		}
	} else if (flow == "upward") {
		let winnerIndex = topTenList.indexOf(winner);
		let loserIndex = topTenList.indexOf(loser);
		if (winnerIndex > loserIndex) topTenList.pull(winner);
		else flow = "downward";
		if (topTenList[0] == winner) flow = "downward";
	}
	if (flow == "upward") {
		choices[0] = topTenList[topTenList.indexOf(winner)];
		choices[1] = topTenList[topTenList.indexOf(winner) - 1];
		choices.sort((a, b) => 0.5 - Math.random());
		labelA.innerHTML = choices[0], labelB.innerHTML = choices[1];
	} else if (topTenList.length !== 10) {
		choices[0] = list[0];
		choices[1] = topTenList[topTenList.length - 1];
		choices.sort((a, b) => 0.5 - Math.random());
		labelA.innerHTML = choices[0], labelB.innerHTML = choices[1];
	} else {
		let title = document.getElementsByClassName("title")[0].value;
		let continueList = document.getElementById("continue_list");
		let results = document.getElementById("results");
		let finalList = document.getElementById("final_list");
		let listTitle = document.getElementById("list_title");
		continueList.style.display = "none";
		results.style.display = "block";
		listTitle.innerHTML = title;
		topTenList.forEach((item) => {
			let li = document.createElement("li");
			li.innerHTML = item;
			finalList.appendChild(li);
		});
	}
}
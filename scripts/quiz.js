// © 2019 Daniel Granovetter

let app = {
	quiz: {}, dir: "", currentImg: null,
	init: function() {
		this.loadQuiz("ice-cream");
	},
	loadQuiz: function(whichQuiz) {
		getData("JSON", "json/" + whichQuiz + ".json", (quizData) => {
			quizImg = document.getElementById("quiz_img");
			quizImg.style.display = "block";
			this.quiz = quizData;
			this.quiz.dir = this.dir;
			let title = document.getElementsByClassName("quiz_title")[0];
			let author = document.getElementById("author");
			let description = document.getElementById("description");
			let startQuiz = document.getElementById("start_button");
			this.currentImg = this.quiz.img;
			this.drawImg();
			title.innerHTML = this.quiz.title;
			author.innerHTML = this.quiz.author;
			description.innerHTML = this.quiz.description;
			startQuiz.style.display = "inline-block";
			
			// Reconfigure layout in the event that quiz is accessed from within iframe
			
			if (parent !== top) dom.snatch(dom.grab("section")[0], dom.grab(".contents"));
		});
	},
	startQuiz: function() {
		this.quiz.question = 0;
		this.quiz.totalQuestions = Object.keys(this.quiz.questions).length;
		this.checkAnswers();
		this.doQuiz();
	},
	retakeQuiz: function() {
		let result = document.getElementById("result");
		let description = document.getElementById("description");
		let retakeQuiz = document.getElementById("retake_button");
		result.style.display = "none";
		description.style.display = "none";
		retakeQuiz.style.display = "none";
		this.currentImg = this.quiz.img;
		this.drawImg(this.dir + "images/" + this.currentImg + ".jpg");
		for (let i in this.quiz.results) this.quiz.results[i].score = 0;
		for (let i in this.quiz.questions) {
			for (let j in this.quiz.questions[i].answers) {
				for (let k in this.quiz.questions[i].answers[j][1]) this.quiz.results[k].totalPoints = 0;
			}
		}
		this.startQuiz();
	},
	doQuiz: function() {
		let question = document.getElementById("question");
		let questionNumber = document.getElementById("question_number");
		let choices = document.getElementById("choices");
		if (this.quiz.question == 0) {
			let description = document.getElementById("description");
			let startButton = document.getElementById("start_button");
			description.style.display = "none";
			startButton.style.display = "none";
			questionNumber.style.display = "block";
			questionNumber.style.width = quizImg.width + "px";
			question.style.display = "block";
			question.style.width = quizImg.width + "px";
			this.quiz.question ++;
		}
		questionNumber.innerHTML = "Question " + this.quiz.question + " out of " + this.quiz.totalQuestions + ": ";
		question.innerHTML = this.quiz.questions[this.quiz.question].question;
		let answers = this.quiz.questions[this.quiz.question].answers;
		if (this.quiz.random.questions == true) {
			let currentAnswers = Object.values(answers);
			currentAnswers.sort((a, b) => 0.5 - Math.random());
			let counter = 0;
			for (let i in this.quiz.questions[this.quiz.question].answers) {
				this.quiz.questions[this.quiz.question].answers[i] = currentAnswers[counter];
				counter ++;
			}
		}
		for (let i in answers) {
			let choice = document.createElement("li");
			choice.innerHTML = answers[i][0];
			choice.setAttribute("class", "choice");
			choice.setAttribute("id", i);
			choice.setAttribute("onclick", "app.doChoice()");
			choices.appendChild(choice);
			choices.style.display = "block";
			choices.style.width = quizImg.width + "px";
		}
	},
	doChoice: function() {
		let choice = event.target.id;
		let points = this.quiz.questions[this.quiz.question].answers[choice][1];
		for (let i in points) {
			if (this.quiz.results[i].score == undefined) this.quiz.results[i].score = 0;
			this.quiz.results[i].score += points[i];
		}
		let answers = this.quiz.questions[this.quiz.question].answers;
		for (let i in answers) document.getElementById(i).remove();
		if (this.quiz.question !== Object.keys(this.quiz.questions).length) {
			this.quiz.question ++;
			this.doQuiz();
		} else {
			let question = document.getElementById("question");
			let questionNumber = document.getElementById("question_number");
			let choices = document.getElementById("choices");
			let result = document.getElementById("result");
			let description = document.getElementById("description");
			let retakeQuiz = document.getElementById("retake_button");
			let score = [];
			for (let i in this.quiz.results) score.push(this.quiz.results[i].score);
			let highestScore = Math.max.apply(null, score);
			let winner = Object.keys(this.quiz.results)[score.indexOf(highestScore)];
			questionNumber.style.display = "none";
			question.style.display = "none";
			choices.style.display = "none";
			result.style.display = "block";
			description.style.display = "block";
			retakeQuiz.style.display = "inline-block";
			this.currentImg = this.quiz.results[winner].img;
			this.drawImg(this.dir + "images/" + this.currentImg + ".jpg");
			result.innerHTML = this.quiz.results[winner].name;
			description.innerHTML = this.quiz.results[winner].personality;
		}
	},
	checkAnswers: function() {
		let results = Object.keys(this.quiz.results).length;
		for (let i in this.quiz.questions) {
			for (let j in this.quiz.questions[i].answers) {
				if (Object.keys(this.quiz.questions[i].answers[j][1]).length < results) console.log("You are missing results in answer " + i + j);
				for (let k in this.quiz.questions[i].answers[j][1]) {
					if (this.quiz.results[k].totalPoints == undefined) this.quiz.results[k].totalPoints = 0;
					this.quiz.results[k].totalPoints += this.quiz.questions[i].answers[j][1][k];
				}
			}
		}
		let averagePoints = 0;
		for (let i in this.quiz.results) averagePoints += this.quiz.results[i].totalPoints;
		averagePoints = Math.round(averagePoints /= Object.keys(this.quiz.results).length);
		for (let i in quiz.results) {
			let totalPoints = this.quiz.results[i].totalPoints;
			if (averagePoints > totalPoints && averagePoints - totalPoints > 2) console.log("It is too hard to get result: " + i);
			else if (averagePoints < totalPoints && totalPoints - averagePoints > 2) console.log("It is too easy to get result: " + i);
		}
	},
	drawImg: function() {
		let quizImg = document.getElementById("quiz_img");
		quizImg.src = "images/" + this.currentImg + ".jpg";
	}
};

function getData(type, url, callback) {
	let xhr = new XMLHttpRequest();
	let data = null;
	xhr.onreadystatechange = () => {
		if (xhr.readyState == 4 && xhr.status == 200) {
			if (type == "JSON" && xhr.response !== "") data = JSON.parse(xhr.response);
			else if (type == "text") data = xhr.response;
			callback(data);
		}
	}
	xhr.open("GET", url, true);
	xhr.send();
}

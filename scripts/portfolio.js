// © 2019-2020 Daniel Granovetter

const page = {
	sitemap: {
		home: {name: "Home", loc: "index.html"},
		projects: {name: "JavaScript", loc: "projects.html", subpages: {
				collage: {name: "Collage Maker", loc: "collage-maker.html"},
				memorygame: {name: "Memory Game", loc: "memory-game.html"},
				quiz: {name: "Personality Quiz", loc: "quiz.html"},
				wordsearch: {name: "Word Search Maker", loc: "wordsearch.html"},
				topten: {name: "Top Ten List Maker", loc: "top-ten.html"}
			}
		},
		reactJS: {name: "ReactJS", loc: "react-app.html"},
		apps: {name: "Mobile Apps", loc: "https://play.google.com/store/apps/developer?id=DJ+Granovetter&hl=en_US"},
		database: {name: "Database", loc: "database.html"},
		certification: {name: "Certification", loc: "certification.html"}
	},
	init: function() {
		this.menu.start();
		let footerText = document.getElementById("footer_text");
		let year = new Date().getFullYear();
		footerText.innerHTML = "© " + year + " Daniel Granovetter";
		let marquee = document.getElementsByTagName("marquee")[0];
		if (marquee) {
			let arr = ["HTML", "CSS", "JavaScript", "JSON", "NodeJS", "ReactJS", "PHP", "SQL", "MySQL"];
			for (let i = 0; i < arr.length; i ++) {
				for (let j = 0; j < 2; j ++) {
					let span = document.createElement("span");
					if (j == 0) span.innerHTML = arr[i];
					else if (j == 1 && i !== arr.length - 1) span.innerHTML = "*";
					else break;
					marquee.appendChild(span);
				}
			}
		}
		document.body.setAttribute("onresize", "page.menu.start()");
		if (typeof app !== "undefined") app.init();
	},
	menu: {
		menuNames: [],
		responsive: {btn: false, menu: false},
		set mouseWithin(obj) {
			this.responsive[obj.item] = obj.setting;
			if (this.responsive.btn == true || this.responsive.menu == true) this.dropDownMenu();
			else this.dropDownRemove();
		},
		start: function() {
			this.menuNames = [];
			let nav = document.getElementsByTagName("nav")[0];
			let navMenu = document.getElementsByClassName("nav_menu")[0];
			navMenu.remove();
			navMenu = document.createElement("span");
			navMenu.setAttribute("class", "nav_menu");
			nav.appendChild(navMenu);
			let menuButton = document.getElementsByClassName("menu_button")[0];
			menuButton.setAttribute("onclick", "page.menu.doMenu()");
			let rMenu = document.getElementById("r_menu");
			if (rMenu) rMenu.remove();
			rMenu = document.createElement("div");
			let menuList = document.createElement("ul");
			let a = null, li = null, currentPage = {}, pageMatch = false;
			for (let item in page.sitemap) {
				for (let i = 0; i < 2; i ++) {
					currentPage = page.sitemap[item];
					a = document.createElement("a");
					a.setAttribute("href", currentPage.loc);
					if (i == 0) {
						if (page.getPage() == currentPage.loc) pageMatch = true;
						if (typeof currentPage.subpages !== "undefined") {
							for (let sub in currentPage.subpages) {
								if (page.getPage() == currentPage.subpages[sub].loc) pageMatch = true;
							}
						}
						if (pageMatch == true) a.setAttribute("class", "active");
						pageMatch = false;
					}
					a.innerHTML = currentPage.name;
					if (i == 0) navMenu.appendChild(a);
					else {
						li = document.createElement("li");
						li.appendChild(a);
						menuList.appendChild(li);
					}
				}
			}
			rMenu.appendChild(menuList);
			rMenu.setAttribute("class", "responsive_menu");
			rMenu.setAttribute("id", "r_menu");
			nav.appendChild(rMenu);
			let screenSize = window.matchMedia("(min-width: 768px)");
			if (screenSize.matches) this.adjustMenu();
			if (typeof app !== "undefined" && typeof app.resize !== "undefined") app.resize();
		},
		doMenu: function() {
			let rMenu = document.getElementById("r_menu");
			let menuButton = document.getElementsByClassName("menu_button")[0];
			rMenu.style.display = "inline-block";
			menuButton.innerHTML = "Menu &#9650";
			menuButton.setAttribute("onclick", "page.menu.closeMenu()");
		},
		closeMenu: function() {
			let rMenu = document.getElementById("r_menu");
			let menuButton = document.getElementsByClassName("menu_button")[0];
			if (!rMenu) return;
			rMenu.style.display = "none";
			menuButton.innerHTML = "Menu &#9660";
			menuButton.setAttribute("onclick", "page.menu.doMenu()");
		},
		adjustMenu: function() {
			this.closeMenu();
			let contents = document.getElementsByClassName("contents")[0];
			let navMenu = document.getElementsByClassName("nav_menu")[0];
			let contentsWidth = contents.offsetWidth;
			let navWidth = navMenu.offsetWidth;
			let current = null;
			while (navWidth > contentsWidth) {
				for (let i = 0; i < 2; i ++) {
					current = navMenu.children[navMenu.children.length - 1];
					if (!current.innerHTML.includes("More")) this.menuNames.unshift([current.innerHTML, current.href]);
					current.remove();
				}
				let dropDown = document.createElement("a");
				dropDown.setAttribute("onmouseover", "page.menu.mouseWithin = {item: 'btn', setting: true}");
				dropDown.setAttribute("onmouseleave", "page.menu.mouseWithin = {item: 'btn', setting: false}");
				dropDown.style.cursor = "pointer";
				dropDown.innerHTML = "More &#9660";
				navMenu.appendChild(dropDown);
				navWidth = navMenu.offsetWidth;
			}
		},
		dropDownMenu: function() {
			if (!document.getElementById("e_menu")) {
				let nav = document.getElementsByTagName("nav")[0];
				let contents = document.getElementsByClassName("contents")[0];
				let navMenu = document.getElementsByClassName("nav_menu")[0];
				let eMenu = document.createElement("div");
				let remainder = contents.offsetWidth - navMenu.offsetWidth;
				let menuList = document.createElement("ul");
				eMenu.setAttribute("class", "responsive_menu");
				eMenu.setAttribute("id", "e_menu");
				eMenu.setAttribute("onmouseenter", "page.menu.mouseWithin = {item: 'menu', setting: true}");
				eMenu.setAttribute("onmouseleave", "page.menu.mouseWithin = {item: 'menu', setting: false}");
				eMenu.style.top = "45px";
				eMenu.style.right = remainder.toString() + "px";
				eMenu.style.display = "inline-block";
				eMenu.style.marginRight = "0";
				let a = null, li = null;
				this.menuNames.forEach((item) => {
					li = document.createElement("li");
					a = document.createElement("a");
					a.innerHTML = item[0];
					a.href = item[1];
					li.appendChild(a);
					menuList.appendChild(li);
					eMenu.appendChild(li);
				});
				nav.appendChild(eMenu);
			}
		},
		dropDownRemove: function() {
			let eMenu = document.getElementById("e_menu");
			if (eMenu) eMenu.remove();
		}
	},
	getPage: function() {
		let currentLocation = location.toString();
		let currentPage = currentLocation.split("/");
		return currentPage[currentPage.length - 1];
	},
	doProblem: function(problemText) {
		let problemField = document.getElementById("problem_field");
		if (problemField !== null) problemField.innerHTML = problemText;
	}
};
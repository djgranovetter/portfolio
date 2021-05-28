class App extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			dilemma: "",
			message: "",
			messageStyle: {
				fontSize: "20px",
				color: "green"
			}
		}
	}
	
	setDilemma = () => {
		this.setState({dilemma: event.target.value});
	}
	
	doWinner = (message) => {
		this.setState({
			message: message,
			messageStyle: {
				fontSize: "20px",
				color: "green"
			}
		});
	}
	
	doError = (message) => {
		this.setState({
			message: message,
			messageStyle: {
				fontSize: "20px",
				color: "red"
			}
		});
	}
	
	render() {
		return (
			<div>
				<h1>Dilemma Resolver</h1>
				<div>
					<h2>Resolve any dilemma in 4 easy steps:</h2>
					<ol>
						<li>Enter your dilemma</li>
						<li>Enter the options you need to choose between. (You must have a minimum of two and a maximum of six.)</li>
						<li>Every option will have its pros and cons. But wait! Not all pros and cons carry equal weight. For each pro and con, assign a weighted value between 1 and 5.</li>
						<li>Hit the Calculate button to determine which option you should go with. And now your dilemma is all resolved!</li>
					</ol>
				</div>
				<form>
					<div>
						<strong>Dilemma</strong><br />
						<input type="text" placeholder="Enter your dilemma" onChange={this.setDilemma} /><br /><br />
						<Options dilemma={this.state.dilemma} winner={(message) => this.doWinner(message)} error={(message) => this.doError(message)} />
						<div style={this.state.messageStyle}><strong>{this.state.message}</strong></div>
					</div>
				</form>
			</div>
		);
	}
}

class Options extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			options: []
		}
		
		this.optionCount = 2;
		
		this.points = {
			pros: [],
			cons: []
		}
		
		this.optionText = [];
		this.proconText = {};
		
		this.proconText.pros = [];
		this.proconText.cons = [];
		
		for (let i = 0; i < this.optionCount; i ++) {
			this.optionText.push("");
			
			this.proconText.pros.push(["", ""]);
			this.proconText.cons.push(["", ""]);
			
			this.points.pros.push(2);
			this.points.cons.push(2);
		}
		
		this.update();
	}
	
	componentDidMount() {
		this.mounted = true;
	}
	
	update() {
		this.options = [];
		
		for (let i = 0; i < this.optionCount; i ++) this.options.push(<Option index={i + 1} calc={this.calc} updateText={this.updateText} />);
		
		if (!this.mounted) this.state.options = this.options;
		else this.setState({options: this.options});
	}
	
	updateText = (index, text = null, procon) => {
		if (text !== null) {
			this.proconText[procon][index - 1] = text;
		} else {
			text = event.target.value;
			this.optionText[index - 1] = text;
		}
	}
	
	addOption = (count) => {
		if ((this.optionCount + count) < 2 || (this.optionCount + count) > 6) return;
		
		this.optionCount += count;
		
		if (Math.sign(count) == 1) {
			this.optionText.push("");
			
			this.proconText.pros.push(["", ""]);
			this.proconText.cons.push(["", ""]);
		} else {
			this.optionText.pop();
			
			this.proconText.pros.pop();
			this.proconText.cons.pop();
			
			this.points.pros.pop();
			this.points.cons.pop();
		}
		
		this.update();
	}
	
	calc = (index, pros, cons) => {
		this.points.pros[index - 1] = pros.reduce((total, item) => total + item);
		this.points.cons[index - 1] = cons.reduce((total, item) => total + item);
	}
	
	getResult = () => {
		let errorMessage = "";
		
		if (this.props.dilemma == "") errorMessage = "Please enter dilemma.";
		else if (this.optionText.includes("")) errorMessage = "Please fill out all the options.";
		else if (this.proconText.pros.flat().includes("")) errorMessage = "Please fill out all the pros.";
		else if (this.proconText.cons.flat().includes("")) errorMessage = "Please fill out all the cons.";
		
		if (errorMessage !== "") {
			this.props.error(errorMessage);
			return;
		}
		
		let totalPros = this.points.pros.map((item, index) => item - this.points.cons[index]);
		let winner = Math.max.apply(null, totalPros);
		let winnerIndex = totalPros.indexOf(winner) + 1;
		
		this.props.winner("And the winner is: Option " + winnerIndex + "!");
	}
	
	render() {
		return (
			<div>
				{this.state.options}
				<div>
					<button type="button" onClick={() => this.addOption(1)}>Add Option</button>
					<button type="button" onClick={() => this.addOption(-1)}>Remove Option</button>
					<button type="button" onClick={() => this.getResult()}>Calculate Best Option</button>
				</div>
				<br /><br />
			</div>
		);
	}
}

class Option extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			pros: [],
			cons: []
		};
		
		this.pros = {
			text: [],
			points: [],
			render: []
		};
		
		this.cons = {
			text: [],
			points: [],
			render: []
		};
		
		for (let i = 0; i < 2; i ++) {
			this.pros.text.push("");
			this.pros.points.push(1);
			
			this.cons.text.push("");
			this.cons.points.push(1);
		}
		
		this.mounted = false;
		
		this.doSet("pro", 2);
		this.doSet("con", 2);
		
		this.doUpdate();
	}
	
	componentDidMount() {
		this.mounted = true;
	}
	
	doUpdate() {
		if (!this.mounted) this.state.pros = this.pros.render, this.state.cons = this.cons.render;
		else this.setState({pros: this.pros.render, cons: this.cons.render});
	}
	
	doSet(procon, count = 1) {
		for (let i = 0; i < count; i ++) {
			if (procon == "pro") {
				this.pros.render.push(
					<tr>
						<td><input type="text" onChange={() => this.doText("pros", i)} /></td>
						<td style={{textAlign: "right"}}><Dropdown procon="pros" index={i + 1} points={this.doPoints} /></td>
					</tr>
				);
			} else if (procon == "con") {
				this.cons.render.push(
					<tr>
						<td><input type="text" onChange={() => this.doText("cons", i)} /></td>
						<td style={{textAlign: "right"}}><Dropdown procon="cons" index={i + 1} points={this.doPoints} /></td>
					</tr>
				);
			}
		}
	}
	
	doAdd = (procon, count) => {
		let total = 0;
		
		if (procon == "pro") {
			total = this.pros.render.length + count;
			this.pros.render = [];
			
			Math.sign(count) == 1 ? this.pros.text.push("") : this.pros.text.pop();
			Math.sign(count) == 1 ? this.pros.points.push(1) : this.pros.points.pop();
			
			this.props.updateText(this.props.index, this.pros.text, "pros");
		} else if (procon == "con") {
			total = this.cons.render.length + count;
			this.cons.render = [];
			
			Math.sign(count) == 1 ? this.cons.text.push("") : this.cons.text.pop();
			Math.sign(count) == 1 ? this.cons.points.push(1) : this.cons.points.pop();
			
			this.props.updateText(this.props.index, this.cons.text, "cons");
		}
		
		if (total < 1 || total > 10) return;
		
		this.doSet(procon, total);
		this.doUpdate();
		
		this.props.calc(this.props.index, this.pros.points, this.cons.points);
	}
	
	doText = (procon, index) => {
		let val = event.target.value;
		this[procon].text[index] = val;
		
		this.props.updateText(this.props.index, this[procon].text, procon);
	}
	
	doPoints = (procon, index) => {
		let val = parseInt(event.target.value);
		this[procon].points[index - 1] = val;
		
		this.props.calc(this.props.index, this.pros.points, this.cons.points);
	}
	
	render() {
		return (
			<div id={"option_" + this.props.index}>
				<strong>Option {this.props.index}</strong><br />
				<input type="text" placeholder="Enter option" onChange={() => this.props.updateText(this.props.index)} /><br /><br />
				<Procons pros={this.state.pros} cons={this.state.cons} add={this.doAdd} /><br /><br />
			</div>
		);
	}
}

class Procons extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div style={{display: "flex", justifyContent: "space-between"}}>
				<div style={{width: "48%"}}>
					<div style={{fontWeight: "bold"}}>Pros</div>
					<table>
						{this.props.pros}
					</table>
					<span class="add" onClick={() => this.props.add("pro", 1)}>+ Add</span>&nbsp;&nbsp;
					<span class="remove" onClick={() => this.props.add("pro", -1)}>- Remove</span>&nbsp;&nbsp;
				</div>
				<div style={{width: "48%"}}>
					<div style={{fontWeight: "bold"}}>Cons</div>
					<table>
						{this.props.cons}
					</table>
					<span class="add" onClick={() => this.props.add("con", 1)}>+ Add</span>&nbsp;&nbsp;
					<span class="remove" onClick={() => this.props.add("con", -1)}>- Remove</span>&nbsp;&nbsp;
				</div>
			</div>
		);
	}
}

class Dropdown extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<select onChange={() => this.props.points(this.props.procon, this.props.index)}>
				<option>1</option>
				<option>2</option>
				<option>3</option>
				<option>4</option>
				<option>5</option>
			</select>
		);
	}
}

ReactDOM.render(<App />, document.getElementById("root"));
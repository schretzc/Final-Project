class Calculator {
	constructor(previousOperandTextElement, currentOperandTextElement) {
		this.previousOperandTextElement = previousOperandTextElement;
		this.currentOperandTextElement = currentOperandTextElement;
		this.clear();
		this.expression = "";
	}

	clear() {
		this.currentOperand = "";
		this.previousOperand = "";
		this.operation = undefined;
		this.expression = "";
		this.isResult = false;
	}

	delete() {
		this.currentOperand = this.currentOperand.toString().slice(0, -1);
	}

	appendNumber(number) {
		console.log("appendNumber -> expression:", this.expression);
		console.log(
			"Last char code:",
			this.expression.charCodeAt(this.expression.length - 1)
		);

		if (this.isResult) {
			this.currentOperand = "";
			this.expression = "";
			this.isResult = false;
		}

		if (number === "." && this.currentOperand.includes(".")) {
			return;
		}

		if (number === "(" || number === ")") {
			this.currentOperand += number;
			this.expression += number;
			return;
		}

		if (number === "π") {
			if (this.currentOperand === "") {
				this.currentOperand = Math.PI.toString();
				this.expression += Math.PI.toString(); // ✅ You were missing this
				this.isResult = true;
			} else {
				const result = parseFloat(this.currentOperand) * Math.PI;
				this.currentOperand = result.toString();
				this.expression += `*${Math.PI}`;
				this.isResult = true;
			}
			return;
		}

		// Normalize fancy minus (U+2212) to regular minus
		if (number === "−") {
			number = "-";
		}

		if (number === "-") {
			// Allow if it's the first character typed
			if (this.expression === "" && this.currentOperand === "") {
				this.currentOperand = "-";
				this.expression = "-";
				return;
			}

			// Allow if last character was an operator or open parenthesis
			const lastChar = this.expression.slice(-1);
			if (
				lastChar === "(" ||
				["+", "-", "*", "/", "%", "^"].includes(lastChar)
			) {
				this.currentOperand += "-";
				this.expression += "-";
				return;
			}
		}

		this.currentOperand += number.toString();
		this.expression += number.toString();
	}

	chooseOperation(operation) {
		if (this.currentOperand === "" && this.expression === "") return;

		// Handle square root symbol visually
		if (operation === "√") {
			this.currentOperand += "√(";
			this.expression += "Math.sqrt(";
			this.updateDisplay();
			return;
		}

		// Translate display-friendly symbols to code
		const symbolMap = {
			"×": "*",
			"÷": "/",
			"^": "**",
		};

		const opForEval = symbolMap[operation] || operation;

		this.expression += opForEval;
		this.currentOperand += operation;

		this.previousOperand = this.currentOperand;

		//if (!this.currentOperandTextElement.includes("(")){
		//	this.currentOperand = "";
		//}

		this.updateDisplay();
	}

	compute() {
		console.log("Raw expression:", this.expression);
		console.log(
			"Character codes:",
			[...this.expression].map((c) => c.charCodeAt(0))
		);

		let computation;

		if (this.operation) {
			const prev = parseFloat(this.previousOperand);
			const current = parseFloat(this.currentOperand);

			switch (this.operation) {
				case "+":
					if (isNaN(prev) || isNaN(current)) return;
					computation = prev + current;
					break;
				case "-":
					if (isNaN(prev) || isNaN(current)) return;
					computation = prev - current;
					break;
				case "*":
					if (isNaN(prev) || isNaN(current)) return;
					computation = prev * current;
					break;
				case "/":
					if (isNaN(prev) || isNaN(current)) return;
					computation = prev / current;
					break;
				case "%":
					if (isNaN(prev) || isNaN(current)) return;
					computation = (prev / 100) * current;
					break;
				case "^":
					if (isNaN(prev) || isNaN(current)) return;
					computation = prev ** current;
					break;
				case "√":
					if (isNaN(current)) return;
					computation = Math.sqrt(current);
					break;
				default:
					return;
			}

			this.currentOperand = computation.toString();
			this.expression = this.currentOperand;
			this.operation = undefined;
			this.previousOperand = "";
			this.isResult = true;
			return;
		}

		try {
			const sanitizedExpression = this.expression
				.replace(/[×⨉✕∗]/g, "*")
				.replace(/[÷]/g, "/")
				.replace(/√/g, "Math.sqrt")
				.replace(/\u2212/g, "-");

			console.log("Evaluating expression:", sanitizedExpression);

			const result = eval(sanitizedExpression);
			this.currentOperand = result.toString();
			this.expression = result.toString();
			this.previousOperand = "";
			this.operation = undefined;
			this.isResult = true;
		} catch {
			this.currentOperand = "Error";
			this.expression = "";
			this.isResult = true;
		}
	}

	getDisplayNumber(number) {
		if (!this.isResult) {
			return number.toString();
		}
		const num = parseFloat(number);
		if (isNaN(num)) return "";

		// if integer, just return it
		if (Number.isInteger(num)) {
			return num.toString();
		}

		// otherwise, show up to 6 decimal places
		return num.toFixed(6).replace(/\.?0+$/, "");
	}

	updateDisplay() {
		this.currentOperandTextElement.innerText = this.getDisplayNumber(
			this.currentOperand
		);
		if (this.operation != null) {
			this.previousOperandTextElement.innerText = `${this.previousOperand} ${this.operation}`;
		} else {
			this.previousOperandTextElement.innerText = "";
		}
	}
}

const numberButtons = document.querySelectorAll("[data-number]");
const operationButtons = document.querySelectorAll("[data-operation]");
const equalsButton = document.querySelector("[data-equals]");
const deleteButton = document.querySelector("[data-delete]");
const allClearButton = document.querySelector("[data-all-clear]");

const previousOperandTextElement = document.querySelector(
	"[data-previous-operand]"
);
const currentOperandTextElement = document.querySelector(
	"[data-current-operand]"
);

const calculator = new Calculator(
	previousOperandTextElement,
	currentOperandTextElement
);

const scientificButtons = document.querySelectorAll("[data-scientific]");

numberButtons.forEach((button) => {
	button.addEventListener("click", () => {
		calculator.appendNumber(button.innerText);
		calculator.updateDisplay();
	});
});

operationButtons.forEach((button) => {
	button.addEventListener("click", () => {
		calculator.chooseOperation(button.innerText);
		calculator.updateDisplay();
	});
});

equalsButton.addEventListener("click", () => {
	calculator.compute();
	calculator.updateDisplay();
});

allClearButton.addEventListener("click", () => {
	calculator.clear();
	calculator.updateDisplay();
});

deleteButton.addEventListener("click", () => {
	calculator.delete();
	calculator.updateDisplay();
});

scientificButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const func = button.dataset.scientific;
		let value = parseFloat(calculator.currentOperand);
		if (isNaN(value)) return;

		switch (func) {
			case "sin":
				calculator.currentOperand = Math.sin(value).toString();
				break;
			case "cos":
				calculator.currentOperand = Math.cos(value).toString();
				break;
			case "tan":
				calculator.currentOperand = Math.tan(value).toString();
				break;
			case "log":
				calculator.currentOperand = Math.log10(value).toString();
				break;
			case "ln":
				calculator.currentOperand = Math.log(value).toString();
				break;
			case "exp":
				calculator.currentOperand = Math.exp(value).toString();
				break;
			case "ten":
			case "log_inv":
				calculator.currentOperand = Math.pow(10, value).toString();
				break;
			case "inv":
				calculator.currentOperand = (1 / value).toString();
				break;
			case "fact":
				calculator.currentOperand = factorial(value).toString();
				break;
			case "abs":
				calculator.currentOperand = Math.abs(value).toString();
				break;
			case "ln_inv":
				calculator.currentOperand = Math.exp(value).toString();
				break;
			case "rand":
				calculator.currentOperand = Math.random().toString();
				break;
			default:
				return;
		}

		calculator.isResult = true;
		calculator.updateDisplay();
	});
});

function factorial(n) {
	if (n < 0) return NaN;
	if (n === 0 || n === 1) return 1;
	let result = 1;
	for (let i = 2; i <= n; i++) {
		result *= i;
	}
	return result;
}
document.addEventListener("keydown", (event) => {
	const key = event.key;

	// Numbers & decimal
	if (/\d/.test(key) || key === ".") {
		calculator.appendNumber(key);
		calculator.updateDisplay();
		return;
	}

	// minus: negative vs subtraction
	if (key === "-") {
		const expr = calculator.expression;
		const last = expr.slice(-1);

		//if at start, or right after "(" or another operator → unary minus
		if (
			expr === "" ||
			last === "(" ||
			["+", "*", "/", "%", "^"].includes(last)
		) {
			calculator.appendNumber("-");
		} else {
			// otherwise it’s subtraction
			calculator.chooseOperation("-");
		}

		calculator.updateDisplay();
		return;
	}

	// Other operators
	if (["+", "*", "/", "%", "^"].includes(key)) {
		calculator.chooseOperation(key);
		calculator.updateDisplay();
		return;
	}

	// Compute / equals
	if (key === "Enter" || key === "=") {
		event.preventDefault();
		calculator.compute();
		calculator.updateDisplay();
		return;
	}

	// Delete / backspace
	if (key === "Backspace") {
		calculator.delete();
		calculator.updateDisplay();
		return;
	}

	// Clear (C key)
	if (key.toLowerCase() === "c") {
		calculator.clear();
		calculator.updateDisplay();
		return;
	}

	// √ and π shortcuts
	if (key.toLowerCase() === "r") {
		calculator.chooseOperation("√");
		calculator.updateDisplay();
		return;
	}
	if (key.toLowerCase() === "p") {
		calculator.appendNumber("π");
		calculator.updateDisplay();
		return;
	}
});

s;

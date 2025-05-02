class Calculator {
	constructor(previousOperandTextElement, currentOperandTextElement) {
		this.previousOperandTextElement = previousOperandTextElement;
		this.currentOperandTextElement = currentOperandTextElement;
		this.clear();
	}

	clear() {
		this.currentOperand = "";
		this.previousOperand = "";
		this.operation = undefined;
		this.isResult = false; // added tracker if result is shown
	}

	delete() {
		this.currentOperand = this.currentOperand.toString().slice(0, -1);
	}

	appendNumber(number) {
		if (this.isResult) {
			this.currentOperand = "";
			this.isResult = false;
		}

		if (number === "." && this.currentOperand.includes(".")) {
			return;
		}
		if (number === "π") {
			// If the screen is empty, set π
			if (this.currentOperand === "") {
				this.currentOperand = Math.PI.toString();
				this.isResult = true; // Set result to true after setting π
			} else {
				// Optional: multiply current value by π if π is pressed after a number
				this.currentOperand = (
					parseFloat(this.currentOperand) * Math.PI
				).toString();
				this.isResult = true; // Set result to true after multiplication
			}
			return;
		}
		this.currentOperand = this.currentOperand.toString() + number.toString();
	}

	chooseOperation(operation) {
		if (this.currentOperand === "") return;

		if (["√"].includes(operation)) {
			this.operation = operation;
			this.compute();
			this.updateDisplay(); // Ensure the UI updates immediately
			return;
		}
		if (this.previousOperand !== "") {
			this.compute();
		}
		this.operation = operation;
		this.previousOperand = this.currentOperand;
		this.currentOperand = "";
	}

	compute() {
		let computation;
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
		this.currentOperand = computation;
		this.operation = undefined;
		this.previousOperand = "";
		this.isResult = true; // Set result to true after computation
	}

	getDisplayNumber(number) {
		if (!this.isResult) {
			return number.toString(); // Show raw input while typing
		}
		const num = parseFloat(number);
		if (isNaN(num)) return "";

		// If it's an integer, just return it as-is
		if (Number.isInteger(num)) {
			return num.toString();
		}

		// Otherwise, show up to 6 decimal places
		return num.toFixed(6).replace(/\.?0+$/, ""); // also removes trailing zeroes
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

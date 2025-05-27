interface BinaryNode {
	left: BinaryNode | null;
	right: BinaryNode | null;
	parent: BinaryNode | null;
	type: string;
	word: string | null;
	toString(level?: number): string;
}

interface ParseTree {
	closingParenthesis: Record<string, boolean>;
	current: BinaryNode;
	left: Record<string, boolean>;
	openingParenthesis: Record<string, boolean>;
	precedence: Record<string, number>;
	root: BinaryNode;
	unary: Record<string, boolean>;
	add(node: BinaryNode): void;
	addBinaryOperator(node: BinaryNode): void;
	addClosingParenthesis(): void;
	addOperand(node: BinaryNode): void;
	addUnaryOperator(node: BinaryNode): void;
	compare(node1: BinaryNode | null, node2: BinaryNode): boolean;
	findParent(node: BinaryNode): BinaryNode | null;
	isClosingParenthesis(node: BinaryNode): boolean;
	isOpeningParenthesis(node: BinaryNode): boolean;
	insertToRight(parent: BinaryNode, node: BinaryNode): void;
}

interface ParseTreeOperator {
	left?: boolean;
	parenthesis?: "opening" | "closing";
	precedence?: number;
	unary?: boolean;
}

var PARSE_TREE_ROOT_TYPE = "#ROOT";

function createBinaryNode(type: string, word: string | null): BinaryNode {
	return {
		left: null,
		parent: null,
		right: null,
		type: type,
		word: word,
		toString: binaryNodeToString
	};
}

function binaryNodeToString(this: BinaryNode, level?: number): string {
	level = level || 0;

	var tab = new Array<string>(level + 1).join("    ");
	var inner = (
		this.left || this.right ? "\n" +
		(this.left ? this.left.toString(level + 1) : tab + "    -") + "\n" +
		(this.right ? this.right.toString(level + 1) : tab + "    -") + "\n" +
		tab : ""
	);

	return tab + (inner
		? "<" + (this.word || this.type) + ">" + inner + "</" + (this.word || this.type) + ">"
		: "<" + (this.word || this.type) + " />"
	);
};

export function parseTree(operators: Record<string, ParseTreeOperator>): ParseTree {
	var precedence: Record<string, number> = {};
	var left: Record<string, boolean> = {};
	var unary: Record<string, boolean> = {};
	var openingParenthesis: Record<string, boolean> = {};
	var closingParenthesis: Record<string, boolean> = {};

	for (var k in operators) {
		var op = operators[k];

		if (op.left) {
			left[k] = true;
		}

		if (op.unary) {
			unary[k] = true;
		}

		if (op.parenthesis === "opening") {
			openingParenthesis[k] = true;
		} else if (op.parenthesis === "closing") {
			closingParenthesis[k] = true;
		}

		if (typeof op.precedence === "number") {
			precedence[k] = op.precedence;
		}
	}

	var root = createBinaryNode(PARSE_TREE_ROOT_TYPE, null);

	return {
		closingParenthesis: closingParenthesis,
		current: root,
		left: left,
		openingParenthesis: openingParenthesis,
		precedence: precedence,
		root: root,
		unary: unary,
		add: add,
		addBinaryOperator: addBinaryOperator,
		addClosingParenthesis: addClosingParenthesis,
		addOperand: addOperand,
		addUnaryOperator: addUnaryOperator,
		compare: compare,
		findParent: findParent,
		insertToRight: insertToRight,
		isClosingParenthesis: isClosingParenthesis,
		isOpeningParenthesis: isOpeningParenthesis
	};
}

function add(this: ParseTree, node: BinaryNode): void {
	if (!node) {
		return;
	}

	if (this.isClosingParenthesis(node)) {
		this.addClosingParenthesis();
	} else if (node.type in this.precedence) {
		if (node.type in this.unary) {
			this.addUnaryOperator(node);
		} else {
			this.addBinaryOperator(node);
		}
	} else {
		this.addOperand(node);
	}
}

function addBinaryOperator(this: ParseTree, node: BinaryNode): void {
	node = createBinaryNode(node.type, node.word);
	var parent = this.findParent(node);

	if (parent === null) {
		throw new SyntaxError("Node cannot be inserted.");
	}

	this.insertToRight(parent, node);
}

function addClosingParenthesis(this: ParseTree): void {
	var parent: BinaryNode | null = this.current;

	while (parent && !this.isOpeningParenthesis(parent)) {
		parent = parent.parent;
	}

	if (!parent) {
		throw new SyntaxError("No opening parenthesis. Should not happen.");
	}

	if (this.isOpeningParenthesis(parent)) {
		if (parent.right) {
			parent.right.parent = parent.parent;
		}

		if (parent.parent === null) {
			throw new SyntaxError("Node cannot be inserted.");
		}

		parent.parent.right = parent.right;
		this.current = parent.parent;
	}
}

function addOperand(this: ParseTree, node: BinaryNode): void {
	node = createBinaryNode(node.type, node.word);
	node.parent = this.current;

	if (this.current.left || this.current.type === "ROOT" || !(this.current.type in this.precedence) || this.current.type in this.unary) {
		if (this.current.right) {
			throw new SyntaxError("Third argument for binary operator. Should not happen.");
		}

		this.current.right = node;
	} else {
		this.current.left = node;
	}

	this.current = node;
}

function addUnaryOperator(this: ParseTree, node: BinaryNode): void {
	if (node.type in this.left) {
		this.addOperand(node);
	} else {
		this.addBinaryOperator(node);
	}
}

function compare(this: ParseTree, node1: BinaryNode | null, node2: BinaryNode): node1 is BinaryNode {
	if (!node1 || node1.type === PARSE_TREE_ROOT_TYPE || this.isOpeningParenthesis(node1)) {
		return false;
	}

	var precedence = this.precedence;
	var A = node1.type;
	var B = node2.type;

	if (A in precedence && B in precedence) {
		if (precedence[A] > precedence[B]) {
			return true;
		}

		if (precedence[A] < precedence[B]) {
			return false;
		}

		if (precedence[A] === precedence[B]) {
			if ((A in this.left) !== (B in this.left)) {
				throw new SyntaxError("Same precedence with different associativity is not allowed.");
			}

			return A in this.left;
		}
	}

	if (A in precedence) {
		return false;
	}

	return true;
}

function findParent(this: ParseTree, node: BinaryNode): BinaryNode | null {
	var parent: BinaryNode | null = this.current;

	while (this.compare(parent, node)) {
		parent = parent!.parent;
	}

	return parent;
}

function insertToRight(this: ParseTree, parent: BinaryNode, node: BinaryNode): void {
	var right = parent.right;

	if (right) {
		if (node.type in this.precedence && !(node.type in this.unary)) {
			node.left = right;
		} else {
			node.right = right;
		}

		right.parent = node;
	}

	node.parent = parent;
	parent.right = node;
	this.current = node;
}

function isClosingParenthesis(this: ParseTree, node: BinaryNode): boolean {
	return node.type in this.closingParenthesis;
}

function isOpeningParenthesis(this: ParseTree, node: BinaryNode): boolean {
	return node.type in this.openingParenthesis;
}

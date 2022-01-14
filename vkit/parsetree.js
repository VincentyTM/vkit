(function($){

var ROOT = {toString: function(){ return "ROOT"; }};

function BinaryNode(type, word){
	this.type = type;
	this.word = word;
	this.parent = null;
	this.left = null;
	this.right = null;
}

BinaryNode.prototype.toString = function(level){
	level = level || 0;
	var tab = new Array(level+1).join("    ");
	var inner = (
		this.left || this.right ? "\n" +
		(this.left ? this.left.toString(level+1) : tab + "    -") + "\n" +
		(this.right ? this.right.toString(level+1) : tab + "    -") + "\n" +
		tab : ""
	);
	return tab + (inner
		? "<" + (this.word || this.type) + ">" + inner + "</" + (this.word || this.type) + ">"
		: "<" + (this.word || this.type) + " />"
	);
};

function ParseTree(operators){
	var precedence = {};
	var left = {};
	var unary = {};
	var openingParenthesis = {};
	var closingParenthesis = {};
	for(var k in operators){
		var op = operators[k];
		if( op.left ){
			left[k] = true;
		}
		if( op.unary ){
			unary[k] = true;
		}
		if( op.parenthesis === "opening" ){
			openingParenthesis[k] = true;
		}else if( op.parenthesis === "closing" ){
			closingParenthesis[k] = true;
		}
		if( typeof op.precedence === "number" ){
			precedence[k] = op.precedence;
		}
	}
	this.precedence = precedence;
	this.left = left;
	this.unary = unary;
	this.openingParenthesis = openingParenthesis;
	this.closingParenthesis = closingParenthesis;
	this.root = new BinaryNode(ROOT, null);
	this.curr = this.root;
}

ParseTree.prototype.isOpeningParenthesis = function(node){
	return node.type in this.openingParenthesis;
};

ParseTree.prototype.isClosingParenthesis = function(node){
	return node.type in this.closingParenthesis;
};

ParseTree.prototype.compare = function(node1, node2){
	if(!node1 || node1.type===ROOT || this.isOpeningParenthesis(node1)){
		return false;
	}
	var precedence = this.precedence;
	var A = node1.type;
	var B = node2.type;
	if( A in precedence && B in precedence ){
		if( precedence[A] > precedence[B] ){
			return true;
		}
		if( precedence[A] < precedence[B] ){
			return false;
		}
		if( precedence[A]===precedence[B] ){
			if((A in this.left)!==(B in this.left)){
				throw new SyntaxError("Same precedence with different associativity is not allowed.");
			}
			return A in this.left;
		}
	}
	if( A in precedence ){
		return false;
	}
	return true;
};

ParseTree.prototype.findParent = function(node){
	var parent = this.curr;
	while( this.compare(parent, node) ){
		parent = parent.parent;
	}
	return parent;
};

ParseTree.prototype.insertToRight = function(parent, node){
	var right = parent.right;
	if( right ){
		if( node.type in this.precedence && !(node.type in this.unary) ){
			node.left = right;
		}else{
			node.right = right;
		}
		right.parent = node;
	}
	node.parent = parent;
	parent.right = node;
	this.curr = node;
};

ParseTree.prototype.add = function(node){
	if(!node){
		return;
	}
	if( this.isClosingParenthesis(node) ){
		this.addClosingParenthesis(node);
	}else if( node.type in this.precedence ){
		if( node.type in this.unary ){
			this.addUnaryOperator(node);
		}else{
			this.addBinaryOperator(node);
		}
	}else{
		this.addOperand(node);
	}
};

ParseTree.prototype.addClosingParenthesis = function(node){
	var parent = this.curr;
	while( parent && !this.isOpeningParenthesis(parent) ){
		parent = parent.parent;
	}
	if(!parent){
		throw new SyntaxError("No opening parenthesis. Should not happen.");
	}
	if( this.isOpeningParenthesis(parent) ){
		if( parent.right ){
			parent.right.parent = parent.parent;
		}
		parent.parent.right = parent.right;
		this.curr = parent.parent;
	}
};

ParseTree.prototype.addOperand = function(node){
	node = new BinaryNode(node.type, node.word);
	node.parent = this.curr;
	if( this.curr.left || this.curr.type==="ROOT" || !(this.curr.type in this.precedence) || this.curr.type in this.unary ){
		if( this.curr.right ){
			throw new SyntaxError("Third argument for binary operator. Should not happen.");
		}
		this.curr.right = node;
	}else{
		this.curr.left = node;
	}
	this.curr = node;
};

ParseTree.prototype.addBinaryOperator = function(node){
	node = new BinaryNode(node.type, node.word);
	this.insertToRight(this.findParent(node), node);
};

ParseTree.prototype.addUnaryOperator = function(node){
	if( node.type in this.left ){
		this.addOperand(node);
	}else{
		this.addBinaryOperator(node);
	}
};

$.parseTree = function(precedence, left, unary, openingParenthesis, closingParenthesis){
	return new ParseTree(precedence, left, unary, openingParenthesis, closingParenthesis);
};

})($);

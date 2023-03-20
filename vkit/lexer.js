(function($){

var iterator = typeof Symbol === "function" ? Symbol.iterator : null;

function LexNode(type, word, pos, len){
	this.type = type;
	this.word = word;
	this.pos = pos;
	this.len = len;
	this.ref = null;
}

LexNode.prototype.toString = function(){
	return String(this.word || this.type || "");
};

function Lexer(rules, text){
	var pos = 0;
	var buffer = [];
	
	if( iterator ){
		this[iterator] = function(){
			return this;
		};
	}
	
	this.all = function(){
		var array = [];
		while(!this.ended()){
			array.push(this.shift());
		}
		return array;
	};
	
	this.next = function(){
		return this.ended() ? {done: true} : {done: false, value: this.shift()};
	};
	
	this.shift = function(){
		if( buffer.length ){
			return buffer.pop();
		}
		if( pos < text.length ){
			var ctype, word, len = 0, sub = text.substring(pos);
			for(var type in rules){
				var regex = rules[type];
				var match = regex.exec(sub);
				if( match && match.index === 0 ){
					if( len < match[0].length ){
						word = match[0];
						len = word.length;
						ctype = type;
					}
				}
			}
			if( len === 0 ){
				throw new SyntaxError("Illegal character in lexer input.");
			}
			var node = new LexNode(ctype, word, pos, len);
			pos += len;
			return node;
		}
		throw new SyntaxError("Reached the end of input. Should not happen.");
	};
	
	this.unshift = function(token){
		buffer.push(token);
	};
	
	this.pos = function(){
		return pos;
	};
	
	this.jump = function(p){
		pos = p instanceof LexNode ? p.pos : p;
	};
	
	this.ended = function(){
		return pos >= text.length && !buffer.length;
	};
	
	this.line = function(token){
		var p = token ? token.pos : pos;
		return text.substring(0, p).split("\n").length;
	};
	
	this.charPos = function(token){
		var p = token ? token.pos : pos;
		return p - text.lastIndexOf("\n", p - 1);
	};
	
	this.info = function(token){
		return "'" + (token.word || token.type) + "' at line " + this.line(token) + ", char " + this.charPos(token) + ".";
	};
}

function createLexer(rules, text){
	return arguments.length >= 2 ? new Lexer(rules, text) : {
		scan: function(text){
			return new Lexer(rules, text);
		}
	};
}

$.lexer = createLexer;

})($);

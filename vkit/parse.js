(function($){

var push = Array.prototype.push;

function createError(lexer, message){
	return new SyntaxError("SyntaxError at line " + lexer.line() + ", char " + lexer.charPos() + ": " + message);
}

function createExpectingError(lexer, expect, node){
	return createError(lexer, node
		? "Expecting '" + expect + "' before '" + node + "'."
		: "Unexpected end of input, still expecting '" + expect + "'."
	);
}

function parse(lexer, expecting, map, applyRule, skipToken){
	expecting = expecting.slice().reverse();
	while( expecting.length ){
		var expect = expecting.pop();
		var node = lexer.length === 0 || lexer.ended && lexer.ended() ? null : lexer.shift();
		var lex = node ? node.type || node : null;

		if( skipToken && node && skipToken(node) ){
			expecting.push(expect);
		}else if( expect === lex ){
			if( applyRule ){
				applyRule(expect, node, null);
			}
		}else if( expect in map ){
			var array = lex ? map[expect][lex] : null;
			if( array ){
				push.apply(expecting, array.slice().reverse());
				if( applyRule ){
					applyRule(expect, node, array);
				}
			}else{
				var defaultArray = map[expect][""];
				if( defaultArray ){
					push.apply(expecting, defaultArray.slice().reverse());
					if( node ){
						lexer.unshift(node);
					}
					if( applyRule ){
						applyRule(expect, null, defaultArray);
					}
				}else{
					throw createExpectingError(lexer, expect, node);
				}
			}
		}else{
			throw createExpectingError(lexer, expect, node);
		}
	}
	if( lexer.length || lexer.ended && !lexer.ended() ){
		var next = lexer.shift();
		lexer.unshift(next);
		throw createError(lexer, "Unnecessary tokens starting with '" + next + "'.");
	}
}

$.parse = parse;

})($);

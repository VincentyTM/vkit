(function($){

var push = Array.prototype.push;

function createError(lexer, message){
	return new SyntaxError("SyntaxError at line " + lexer.line() + ", char " + lexer.charPos() + ": " + message);
}

function parse(lexer, expecting, map, applyRule, skipToken){
	expecting = expecting.slice().reverse();
	while( expecting.length ){
		var expect = expecting.pop();

		if( lexer.length === 0 || lexer.ended && lexer.ended() ){
			if( expect.charAt(expect.length - 1) === "?" ){
				continue;
			}
			throw createError(lexer, "Unexpected end of input, still expecting '" + expect + "'.");
		}

		var node = lexer.shift();
		var lex = node.type || node;

		if( skipToken && skipToken(node) ){
			expecting.push(expect);
		}else if( expect === lex ){
			if( applyRule ){
				applyRule(expect, node, null);
			}
		}else if( expect in map ){
			if( lex in map[expect] ){
				push.apply(expecting, map[expect][lex].reverse());
				if( applyRule ){
					applyRule(expect, node, map[expect][lex]);
				}
			}else if( expect.charAt(expect.length - 1) === "?" ){
				lexer.unshift(node);
				if( applyRule ){
					applyRule(expect, null, null);
				}
			}else{
				throw createError(lexer, "Invalid token '" + node + "', expecting '" + expect + "'.");
			}
		}else{
			throw createError(lexer, "Unexpected token '" + node + "', expecting '" + expect + "'.");
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

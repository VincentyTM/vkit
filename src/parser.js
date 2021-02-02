(function($){

$.parse = function(lexer, expecting, map, applyRule){
	expecting = expecting.slice(0);
	try{
		while( expecting.length ){
			
			var expect = expecting.pop();

			if( lexer.length===0 || lexer.ended && lexer.ended() ){
				if( expect.charAt(expect.length-1)==="?" )
					continue;
				throw "Unexpected end of file, still expecting '" + expect + "'.";
			}

			var node = lexer.shift();
			var lex = node.type || node;

			if( expect===lex ){
				if( applyRule )
					applyRule(expect, node, null);
				continue;
			}
			
			if( expect in map ){
				if( lex in map[expect] ){
					Array.prototype.push.apply(expecting, map[expect][lex].reverse());
					if( applyRule )
						applyRule(expect, node, map[expect][lex]);
					continue;
				}
				if( expect.charAt(expect.length-1)==="?" ){
					lexer.unshift(node);
					if( applyRule )
						applyRule(expect, null, null);
					continue;
				}
				throw "Invalid token '" + node + "', expecting '" + expect + "'.";
			}else{
				throw "Unexpected token '" + node + "', expecting '" + expect + "'.";
			}
		}
		if( lexer.length || lexer.ended && !lexer.ended() ){
			var next = lexer.shift();
			lexer.unshift(next);
			throw "Unnecessary tokens starting with '" + next + "'.";
		}
		return "Successfully parsed.";
	}catch(ex){
		return "SyntaxError at line " + lexer.line() + ", char " + lexer.charPos() + ": " + ex;
	}
};

})($);

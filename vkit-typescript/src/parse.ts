import { Lexer, LexerNode } from "./lexer.js";

var push = Array.prototype.push;

function createError(lexer: Lexer, message: string): SyntaxError {
	return new SyntaxError("SyntaxError at line " + lexer.line() + ", char " + lexer.charPos() + ": " + message);
}

function createExpectingError(lexer: Lexer, expect: string, node: LexerNode | null): SyntaxError {
	return createError(lexer, node
		? "Expecting '" + expect + "' before '" + node + "'."
		: "Unexpected end of input, still expecting '" + expect + "'."
	);
}

export function parse(
	lexer: Lexer,
	expecting: string[],
	map: Record<string, Record<string, string[]>>,
	applyRule?: (expect: string, node: LexerNode | null, following: string[] | null) => void,
	skipToken?: (token: LexerNode) => boolean
): void {
	expecting = expecting.slice().reverse();

	while (expecting.length) {
		var expect = expecting.pop() as string;
		var node = lexer.ended() ? null : lexer.shift() || null;
		var type = node ? node.type : null;

		if (skipToken && node && skipToken(node)) {
			expecting.push(expect);
		} else if (expect === type) {
			if (applyRule) {
				applyRule(expect, node, null);
			}
		} else if (expect in map) {
			var array = type ? map[expect][type] : null;

			if (array) {
				push.apply(expecting, array.slice().reverse());

				if (applyRule) {
					applyRule(expect, node, array);
				}
			} else {
				var defaultArray = map[expect][""];

				if (defaultArray) {
					push.apply(expecting, defaultArray.slice().reverse());

					if (node) {
						lexer.unshift(node);
					}

					if (applyRule) {
						applyRule(expect, null, defaultArray);
					}

				} else {
					throw createExpectingError(lexer, expect, node);
				}
			}
		} else {
			throw createExpectingError(lexer, expect, node);
		}
	}

	if (!lexer.ended()) {
		var next = lexer.shift() as LexerNode;
		lexer.unshift(next);
		throw createError(lexer, "Unnecessary tokens starting with '" + next + "'.");
	}
}

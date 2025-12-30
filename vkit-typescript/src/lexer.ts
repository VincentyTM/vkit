var iterator = typeof Symbol === "function" ? Symbol.iterator : null;

export interface Lexer {
	[Symbol.iterator](): Lexer;
	rules: LexerRules;
	all(): LexerNode[];
	charPos(token?: LexerNode): number;
	ended(): boolean;
	info(token: LexerNode): string;
	jump(p: number | LexerNode): void;
	line(token?: LexerNode): number;
	next(): IteratorResult<LexerNode>;
	pos(): number;
	shift(): LexerNode | undefined;
	unshift(token: LexerNode): void;
}

interface LexerCreator {
	scan(text: string): Lexer;
}

export interface LexerNode {
	len: number;
	pos: number;
	ref: null;
	type: string;
	word: string;
	toString(): string;
}

type LexerRules = Record<string, RegExp>;

export function lexer(rules: LexerRules): LexerCreator;

export function lexer(rules: LexerRules, text: string): Lexer;

export function lexer(rules: LexerRules, text?: string): Lexer | LexerCreator {
	return text !== undefined ? createLexer(rules, text) : {
		scan: function(text: string) {
			return createLexer(rules, text);
		}
	};
}

function lexerNodeToString(this: LexerNode): string {
	return String(this.word || this.type || "");
};

function returnSelf<T>(this: T): T {
	return this;
}

function createLexer(rules: LexerRules, text: string): Lexer {
	var pos = 0;
	var buffer: LexerNode[] = [];
	var lexer = {} as Lexer;

	lexer.rules = rules;

	if (iterator) {
		lexer[iterator] = returnSelf;
	}

	lexer.all = function(this: Lexer): LexerNode[] {
		var array: LexerNode[] = [];
		while (!this.ended()) {
			array.push(this.shift()!);
		}
		return array;
	};

	lexer.next = function(this: Lexer): IteratorResult<LexerNode, undefined> {
		return this.ended() ? {
			done: true,
			value: undefined
		} : {
			done: false,
			value: this.shift()!
		};
	};

	lexer.shift = function(this: Lexer): LexerNode | undefined {
		if (buffer.length > 0) {
			return buffer.pop();
		}

		var rules = this.rules;

		if (pos < text.length) {
			var ctype: string | undefined;
			var word: string | undefined;
			var len = 0;
			var sub = text.substring(pos);

			for (var type in rules) {
				var regex = rules[type];
				var match = regex.exec(sub);

				if (match && match.index === 0) {
					if (len < match[0].length) {
						word = match[0];
						len = (word as string).length;
						ctype = type;
					}
				}
			}

			if (len === 0) {
				throw new SyntaxError("Illegal character in lexer input.");
			}

			var node: LexerNode = {
				len: len,
				pos: pos,
				ref: null,
				type: ctype as string,
				word: word as string,
				toString: lexerNodeToString
			};

			pos += len;

			return node;
		}

		throw new SyntaxError("Reached the end of input. Should not happen.");
	};

	lexer.unshift = function(this: Lexer, token: LexerNode): void {
		buffer.push(token);
	};

	lexer.pos = function(this: Lexer): number {
		return pos;
	};

	lexer.jump = function(this: Lexer, p: number | LexerNode): void {
		pos = typeof p === "number" ? p : p.pos;
	};

	lexer.ended = function(this: Lexer): boolean {
		return pos >= text.length && !buffer.length;
	};

	lexer.line = function(this: Lexer, token?: LexerNode): number {
		var p = token ? token.pos : pos;
		return text.substring(0, p).split("\n").length;
	};

	lexer.charPos = function(this: Lexer, token?: LexerNode): number {
		var p = token ? token.pos : pos;
		return p - text.lastIndexOf("\n", p - 1);
	};

	lexer.info = function(this: Lexer, token: LexerNode): string {
		return "'" + (token.word || token.type) + "' at line " + this.line(token) + ", char " + this.charPos(token) + ".";
	};

	return lexer;
}

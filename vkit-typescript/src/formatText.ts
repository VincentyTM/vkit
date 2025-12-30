interface FormatterRule<T> {
	pattern?: RegExp;
	transform(text: string, offset: number): T;
}

/**
 * Formats the given text based on the specified regular expressions.
 * It splits the text into consecutive substrings.
 * If a substring is matched by a pattern, it is transformed by the related function.
 * 
 * The first rule with a matching pattern is applied in the order they are given in the array.
 * If no pattern is given for a rule, it matches all substrings.
 * Unmatched substrings are not transformed.
 * @example
 * function Formatter() {
 * 	return formatText("Link: https://example.com/", [
 * 		{
 * 			pattern: /[a-z]+:\/\/[a-zA-Z0-9\.\/]+/g,
 * 			transform: (text) => A(text, {href: text})
 * 		},
 * 		{
 * 			transform: (text) => B(text)
 * 		}
 * 	]);
 * }
 * 
 * @param text The text to format.
 * @param rules An array of rules.
 * A rule is an object with a transform function and an optional RegExp pattern.
 * @returns An array of transformed (matched) and non-transformed (unmatched) substrings.
 */
export function formatText<T>(
	text: string,
	rules: FormatterRule<T>[]
): (T | string)[] {
	var nodes: (T | string)[] = [];
	splitText(text, rules, 0, 0, nodes);
	return nodes;
}

function splitText<T>(
	text: string,
	rules: FormatterRule<T>[],
	index: number,
	offset: number,
	nodes: (T | string)[]
): void {
	if (index >= rules.length) {
		nodes.push(text);
		return;
	}

	var rule = rules[index];

	if (!rule.pattern) {
		nodes.push(rule.transform(text, offset));
		return;
	}

	var pattern = rule.pattern;
	var match: RegExpExecArray | null;
	var last = 0;

	while (null !== (match = pattern.exec(text))) {
		var a = pattern.lastIndex - match[0].length;
		var b = pattern.lastIndex;
		var matchedText = text.substring(a, b);

		splitText(
			text.substring(last, a),
			rules,
			index + 1,
			offset + last,
			nodes
		);

		nodes.push(
			rule.transform(matchedText, offset + a)
		);

		last = b;
	}

	if (last < text.length) {
		splitText(
			text.substring(last),
			rules,
			index + 1,
			offset + last,
			nodes
		);
	}
}

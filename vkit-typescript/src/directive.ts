import effect from "./effect.js";

export default function directive<E>(
	element: E,
	callback: (element: E) => string | void
): Text | null {
	var node: Text | undefined;
	var text: string | undefined;

	effect(function() {
		if (node) {
			node.nodeValue = callback(element) as string;
		} else {
			text = callback(element) as string | undefined;
		}
	});

	if (text === undefined) {
		return null;
	}

	node = document.createTextNode(text);
	text = undefined;
	return node;
}

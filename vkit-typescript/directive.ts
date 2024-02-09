import effect from "./effect";

export default function directive<ElementType>(
	element: ElementType,
	callback: (element: ElementType) => string | void
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

import { effect } from "./effect.js";

/**
 * Creates and returns a dynamic text node.
 * Its text changes when at least one of its inputs change.
 * Inputs can be added by calling signals in the method's `getText` callback function.
 * @example
 * const name = signal("world");
 * const myTextNode = text(() => `Hello ${name()}`);
 * 
 * @param getText A function that returns the current text.
 * It may contain signal calls.
 * @returns A DOM text node that has the current text as its value.
 */
export function text(getText: () => string | number | bigint | boolean): Text {
	var oldText = "";
	var node = document.createTextNode(oldText);

	effect(function(): void {
		var newText = getText();

		if (oldText !== newText) {
			node.nodeValue = oldText = String(newText);
		}
	});

	return node;
}

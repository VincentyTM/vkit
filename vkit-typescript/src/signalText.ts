import { Signal } from "./signal.js";

/**
 * Creates and returns a text node with the signal's value in it.
 * 
 * When the signal's value changes, so does the text node's value.
 * You do not need to call this method manually, just put the signal in an element factory call.
 * @example
 * function MyComponent() {
 * 	const count = signal(0);
 * 	
 * 	return [
 * 		// This could also be written as Div(signalText(count))
 * 		Div(count),
 * 		
 * 		// Even if the text is a top-level node,
 * 		// there is no need to call signalText(count)
 * 		count
 * 	];
 * }
 * 
 * @returns The text node.
 */
export function signalText<T>(signal: Signal<T>): Text {
	var node = document.createTextNode(String(signal.get()));
	signal.subscribe(updateValue);
	return node;

	function updateValue(value: T): void {
		node.nodeValue = String(value);
	}
}

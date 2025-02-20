import type { Signal } from "./signal.js";

export default function signalText<T>(this: Signal<T>): Text {
	var node = document.createTextNode(String(this.get()));
	this.subscribe(updateValue);
	return node;

	function updateValue(value: T): void {
		node.nodeValue = String(value);
	}
}

import {Signal} from "./signal";

export default function signalText<ValueType>(
	this: Signal<ValueType>
): Text {
	var node = document.createTextNode(String(this.get()));
	this.subscribe(updateValue);
	return node;

	function updateValue(value: ValueType): void {
		node.nodeValue = String(value);
	}
}

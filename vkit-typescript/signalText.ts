import type {Signal} from "./signal";

function signalText<ValueType>(
	this: Signal<ValueType>
){
	var node = document.createTextNode(String(this.get()));
	
	this.subscribe(function(value: ValueType){
		node.nodeValue = String(value);
	});
	
	return node;
}

export default signalText;

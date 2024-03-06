import createComponent from "./component.js";

export default function text(getText: () => string | number): Text {
	var oldText = "";
	var node = document.createTextNode(oldText);
	var component = createComponent(setText);
	
	function setText(): void {
		var newText = getText();
		if (oldText !== newText) {
			node.nodeValue = oldText = String(newText);
		}
	}
	
	component.render();
	return node;
}

import createComponent from "./component";

function createDynamicText(getText: () => string | number){
	var oldText = "";
	var node = document.createTextNode(oldText);
	var component = createComponent(setText);
	
	function setText(){
		var newText = getText();
		
		if( oldText !== newText ){
			node.nodeValue = oldText = String(newText);
		}
	}
	
	component.render();
	
	return node;
}

export default createDynamicText;

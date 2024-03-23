(function($, document){

var createComponent = $.createComponent;

function createDynamicText(getText){
	var oldText = "";
	var node = document.createTextNode(oldText);
	var component = createComponent(setText);
	
	function setText(){
		var newText = getText();
		
		if( oldText !== newText ){
			node.nodeValue = oldText = newText;
		}
	}
	
	component.render();
	
	return node;
}

$.text = createDynamicText;

})($, document);

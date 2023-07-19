(function($, document){

function signalText(){
	var node = document.createTextNode(this.get());
	
	this.subscribe(function(value){
		node.nodeValue = String(value);
	});
	
	return node;
}

$.signalText = signalText;

})($, document);

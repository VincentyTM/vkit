(function($){

var getComponent = $.getComponent;
var setComponent = $.setComponent;

function createText(getter){
	var component = getComponent();
	setComponent(null);
	var oldValue = String(getter());
	setComponent(component);
	var node = document.createTextNode(oldValue);
	component.subscribe(function(){
		var value = String(getter());
		if( oldValue !== value ){
			oldValue = node.nodeValue = value;
		}
	});
	return node;
}

$.text = createText;

})($);

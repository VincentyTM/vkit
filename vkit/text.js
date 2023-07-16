(function($){

var getComponent = $.getComponent;
var onUpdate = $.onUpdate;
var setComponent = $.setComponent;

function createText(getter){
	var component = getComponent();
	setComponent(null);
	
	var oldValue = String(getter());
	setComponent(component);
	
	var node = document.createTextNode(oldValue);
	
	onUpdate(
		function(){
			var value = String(getter());
			if( oldValue !== value ){
				oldValue = node.nodeValue = value;
			}
		},
		
		component
	);
	
	return node;
}

$.text = createText;

})($);

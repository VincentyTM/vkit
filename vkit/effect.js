(function($){

var getComponent = $.getComponent;
var onUpdate = $.onUpdate;
var setComponent = $.setComponent;

function createEffect(setter){
	var component = getComponent();
	setComponent(null);
	
	setter();
	
	setComponent(component);
	onUpdate(setter, component);
}

$.effect = createEffect;

})($);

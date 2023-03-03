(function($){

var getComponent = $.getComponent;
var setComponent = $.setComponent;

function createEffect(setter){
	var component = getComponent();
	setComponent(null);
	setter();
	setComponent(component);
	component.subscribe(setter);
}

$.effect = createEffect;

})($);

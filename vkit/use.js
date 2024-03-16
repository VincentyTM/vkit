(function($) {

var effect = $.effect;
var getComponent = $.getComponent;
var isSignal = $.isSignal;

var none = {};

function use(getValue) {
	if (typeof getValue !== "function") {
		throw new TypeError("getValue is not a function");
	}
	
	var component = getComponent();
	
	if (isSignal(getValue)) {
		var val = getValue.get();
		getValue.subscribe(component.render);
		return val;
	}
	
	var value = none;
	
	effect(function() {
		var oldValue = value;
		value = getValue();
		
		if (oldValue !== value && oldValue !== none) {
			component.render();
		}
	});
	
	return value;
}

$.use = use;

})($);

(function($, undefined) {

var effect = $.effect;
var getComponent = $.getComponent;

function is(condition) {
	if (typeof condition !== "function") {
		throw new TypeError("condition is not a function");
	}
	
	var parent = getComponent();
	var value;
	
	effect(function() {
		var oldValue = value;
		value = !!condition();
		
		if (oldValue !== value && oldValue !== undefined) {
			parent.render();
		}
	});
	
	return value;
}

$.is = is;

})($);

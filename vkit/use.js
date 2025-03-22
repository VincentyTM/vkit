(function($) {

var effect = $.effect;
var getEffect = $.getEffect;
var isSignal = $.isSignal;
var updateEffect = $.updateEffect;

var none = {};

function use(getValue) {
	if (typeof getValue !== "function") {
		throw new TypeError("getValue is not a function");
	}
	
	var parentEffect = getEffect();
	
	if (isSignal(getValue)) {
		var val = getValue.get();
		getValue.subscribe(function() {
			updateEffect(parentEffect);
		});
		return val;
	}
	
	var value = none;
	
	effect(function() {
		var oldValue = value;
		value = getValue();
		
		if (oldValue !== value && oldValue !== none) {
			updateEffect(parentEffect);
		}
	});
	
	return value;
}

$.use = use;

})($);

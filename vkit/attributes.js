(function($) {

var effect = $.effect;
var isSignal = $.isSignal;

function setAttribute(el, name, value) {
	if (typeof value === "number") {
		value = value.toString();
	}
	
	if (typeof value === "string") {
		el.setAttribute(name, value);
		return;
	}
	
	if (value) {
		el.setAttribute(name, "");
		return;
	}
	
	el.removeAttribute(name);
}

function addAttribute(el, name, value) {
	if (typeof value === "number") {
		value = value.toString();
	}
	
	if (typeof value === "string") {
		el.setAttribute(name, value);
		return;
	}
	
	if (isSignal(value)) {
		value.effect(function(val) {
			setAttribute(el, name, val);
		});
		return;
	}
	
	if (typeof value === "function") {
		effect(function() {
			setAttribute(el, name, value());
		});
		return;
	}
	
	if (value) {
		el.setAttribute(name, "");
		return;
	}
	
	el.removeAttribute(name);
}

function bindAttribute(name, value) {
	return function(el) {
		addAttribute(el, name, value);
	};
}

function bindAttributes(attrs) {
	return function(el) {
		for (var name in attrs) {
			addAttribute(el, name, attrs[name]);
		}
	};
}

$.attribute = bindAttribute;
$.attributes = bindAttributes;

})($);

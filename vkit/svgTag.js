(function($, document){

var append = $.append;
var bind = $.bind;
var effect = $.effect;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

var xmlns = "http://www.w3.org/2000/svg";

function setAttribute(el, name, value, persistent) {
	if (!persistent) {
		var old = el.getAttributeNS(null, name);
		
		onUnmount(function() {
			if (el.getAttributeNS(null, name) === value) {
				setAttribute(el, name, old, true);
			}
		});
	}
	
	if (value === null) {
		el.removeAttributeNS(null, name);
	}else{
		el.setAttributeNS(null, name, value);
	}
}

function bindAttribute(el, name, value, persistent) {
	if (typeof value === "function") {
		if (value.effect) {
			value.effect(function(v) {
				setAttribute(el, name, v, persistent);
			});
		} else if (name.indexOf("on") === 0) {
			var unsub = onEvent(el, name.substring(2), value);
			
			if (!persistent) {
				onUnmount(unsub);
			}
		} else {
			effect(function() {
				setAttribute(el, name, value(), persistent);
			});
		}
	} else if (value && typeof value === "object") {
		bind(el[name], value);
	} else {
		setAttribute(el, name, value, persistent);
	}
}

function bindAttributes(el, attributes, persistent) {
	for (var name in attributes) {
		bindAttribute(el, name, attributes[name], persistent);
	}
}

function svgTag(tagName) {
	return function() {
		var el = document.createElementNS(xmlns, tagName);
		append(el, arguments, el, bindAttributes);
		return el;
	};
}

$.svgTag = svgTag;

})($, document);

(function($, document){

var append = $.append;
var effect = $.effect;
var onEvent = $.onEvent;

var xmlns = "http://www.w3.org/2000/svg";

function setAttribute(el, name, value) {
	if (value === null) {
		el.removeAttributeNS(null, name);
	}else{
		el.setAttributeNS(null, name, value);
	}
}

function bindAttribute(el, name, value) {
	if (typeof value === "function") {
		if (value.effect) {
			value.effect(function(v) {
				setAttribute(el, name, v);
			});
		} else if (name.indexOf("on") === 0) {
			onEvent(el, name.substring(2), value);
		} else {
			effect(function() {
				setAttribute(el, name, value());
			});
		}
	} else if (value && typeof value === "object") {
		bind(el[name], value);
	} else {
		setAttribute(el, name, value);
	}
}

function bindAttributes(el, attributes) {
	for (var name in attributes) {
		bindAttribute(el, name, attributes[name]);
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

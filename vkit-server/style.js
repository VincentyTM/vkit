import {getScope} from "./scope.js";

var globalStyleCount = 0;

function prependHyphen(text) {
	return "-" + text;
}

function prepareCSS(css, selector){
	if (typeof css === "string") {
		return css.replace(/::?this\b/ig, selector);
	}
	
	var a = [selector, "{"];
	
	for (var prop in css) {
		var val = css[prop];
		
		if (val) {
			prop = prop.replace(/[A-Z]/g, prependHyphen).toLowerCase();
			a.push(prop, ":", val, ";");
		}
	}
	
	a.push("}");
	return a.join("");
}

export default function style(css, attr) {
	if (!attr) {
		var currentScope = getScope(true);
		attr = "vkit-" + (currentScope ? "s-" + currentScope.nextStyleCount() : ++globalStyleCount);
	}
	
	var selector = "[" + attr + "]";
	
	function bind(el) {
		getScope().addStyle(
			attr,
			prepareCSS(
				css && typeof css.get === "function" ? css.get() : css,
				selector
			)
		);
		
		if (el.setAttribute) {
			el.setAttribute(attr, "");
		}
	}
	
	bind.toString = function() {
		return selector;
	};
	
	return bind;
}

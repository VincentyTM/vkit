import attributes from "./attributes.js";
import isSignal from "./isSignal.js";

var count = 0;

export default function styleSelector(attr, attrValue) {
	if (!attr) {
		attr = "vkit-selector" + (++count);
	}
	
	var selector = "[" + attr + (attrValue ? "=" + attrValue : "") + "]";
	
	if (!attrValue) {
		attrValue = "true";
	}
	
	function directive(cond) {
		if (cond && typeof cond.setAttribute === "function") {
			var a = {};
			a[attr] = attrValue;
			return attributes(a);
		}
		
		if (isSignal(cond)) {
			var a = {};
			a[attr] = cond.get() ? attrValue : null;
			return attributes(a);
		}
		
		if (typeof cond === "function") {
			var a = {};
			a[attr] = cond() ? attrValue : null;
			return attributes(a);
		}
		
		var a = {};
		a[attr] = cond ? attrValue : null;
		return attributes(a);
	}
	
	directive.toString = function() {
		return selector;
	};
	
	return directive;
}

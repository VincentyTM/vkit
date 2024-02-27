import append from "./append.js";
import bind from "./bind.js";
import createElement from "./createElement.js";
import customElementRegistry from "./customElementRegistry.js";
import provide from "./provide.js";
import signal from "./signal.js";

export default function htmlTag(tagName) {
	return function() {
		var el = createElement(tagName);
		append(el, arguments, el, bind);
		
		var customElement = customElementRegistry[tagName.toLowerCase()];
		
		if (customElement) {
			provide(null, function() {
				var attrNames = customElement.observedAttributes;
				var n = attrNames.length;
				var attrs = {};
				
				for (var i = 0; i < n; ++i) {
					var name = attrNames[i];
					attrs[name] = signal(el.getAttribute(name));
				}
				
				var view = customElement.getView.call(el, attrs, el);
				append(el, view, el, bind);
			});
		}
		
		return el;
	};
}

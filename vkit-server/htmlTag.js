var append = require("./append.js");
var bind = require("./bind.js");
var createElement = require("./createElement.js");
var customElementRegistry = require("./customElementRegistry.js");
var provide = require("./provide");
var signal = require("./signal");

function htmlTag(tagName) {
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

module.exports = htmlTag;

import deepPush from "./deepPush.js";
import escapeHTML from "./escapeHTML.js";
import isArray from "./isArray.js";

function createHTML(html) {
	return {
		toHTML: function(res) {
			res.write(html);
		}
	};
}

export default function html(strings) {
	if (isArray(strings) && isArray(strings.raw)) {
		var n = strings.length;
		var a = new Array(2*n - 1);
		
		if (n > 0) {
			a[0] = strings[0];
		}
		
		for (var i = 1, j = 1; i < n; ++i) {
			var arg = arguments[i];
			a[j++] = typeof arg === "string" ? [arg] : arg;
			a[j++] = strings[i];
		}
		
		return html.apply(null, a);
	}
	
	var parts = [];
	var n = arguments.length;
	
	for (var i = 0; i < n; ++i) {
		var arg = arguments[i];
		
		while (arg && typeof arg.render === "function") {
			arg = arg.render();
		}
		
		switch (typeof arg) {
			case "string":
			case "number":
			case "bigint":
			case "symbol":
				parts.push(createHTML(String(arg)));
				break;
			case "object":
				if (arg.toHTML) {
					parts.push(arg);
				} else if (isArray(arg)) {
					deepPush(parts, arg);
				} else {
					throw new Error("Bindings in html are not allowed on the server");
				}
				break;
			case "function":
				parts.push(createHTML(escapeHTML(String(arg(null)))));
				break;
			case "undefined":
			case "boolean":
			default:
				break;
		}
	}
	
	return parts;
}

import escapeHTML from "./escapeHTML.js";

var scope = null;

function replaceStyleEnds(text) {
	return '<\\/' + text.substring(2);
}

export function createScope(req, res) {
	var interceptors = [];
	var styles = [];
	var styleCount = 0;
	var styleKeys = {};
	var windowData = {};
	
	function addStyle(key, css) {
		if (!(key in styleKeys)) {
			styleKeys[key] = true;
			styles.push(css);
		}
	}
	
	function addWindowData(name, value) {
		if (windowData[name]) {
			windowData[name].push(value);
		} else {
			windowData[name] = [value];
		}
	}
	
	function getStyles() {
		return styles.join('\n').replace(/<\/style\b/ig, replaceStyleEnds);
	}
	
	function getWindowData(name, value) {
		var parts = windowData[name];
		
		if (parts) {
			var n = parts.length;
			
			for (var i = 0; i < n; ++i) {
				var part = parts[i];
				
				if (part && typeof part.get === "function") {
					part = part.get();
				}
				
				if (typeof part === "function") {
					value = part(value);
				} else {
					value = part;
				}
			}
		}
		
		return value;
	}
	
	function intercept(callback) {
		interceptors.push(callback);
	}
	
	function meta() {
		return {
			toHTML: function(res) {
				for (var key in windowData) {
					if (key.indexOf("meta:") === 0) {
						var name = key.substring(5);
						var content = getWindowData(key);
						
						res.write('<meta name="');
						res.write(escapeHTML(name));
						res.write('" content="');
						res.write(escapeHTML(content));
						res.write('">');
					}
				}
			}
		};
	}
	
	function nextStyleCount() {
		return ++styleCount;
	}
	
	function renderStyle(res) {
		res.write(getStyles());
	}
	
	function renderWindowData(res, name, value) {
		res.write(escapeHTML(getWindowData(name, value)));
	}
	
	function style() {
		return {
			toHTML: renderStyle,
			toStyleContent: renderStyle
		};
	}
	
	function title(value) {
		return {
			toHTML: function(res) {
				renderWindowData(res, "title", value);
			}
		};
	}
	
	function transformRequest(request) {
		var n = interceptors.length;
		
		for (var i = 0; i < n; ++i) {
			var res = interceptors[i](request);
			
			if (res) {
				return res;
			}
		}
		
		return {unsent: true};
	}
	
	return {
		addStyle: addStyle,
		addWindowData: addWindowData,
		cookies: {},
		getStyles: getStyles,
		getWindowData: getWindowData,
		intercept: intercept,
		meta: meta,
		nextStyleCount: nextStyleCount,
		render: null,
		transformRequest: transformRequest,
		req: req,
		res: res,
		style: style,
		title: title
	};
}

export function getScope(allowNullScope) {
	if (!scope && !allowNullScope) {
		throw new Error("This function can only be called synchronously from a component");
	}
	
	return scope;
}

export function setScope(newScope) {
	scope = newScope;
}

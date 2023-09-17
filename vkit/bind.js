(function($) {

var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var prop = $.prop;

function bind(element, bindings, persistent) {
	for (var name in bindings) {
		var value = bindings[name];
		
		switch (typeof value) {
			case "object":
				if (!value) {
					element[name] = value;
				} else if (value.prop) {
					value.prop(name)(element);
				} else {
					var obj = element[name];
					
					if (obj) {
						bind(obj, value, persistent);
					} else {
						element[name] = value;
					}
				}
				break;
			case "function":
				if (name.indexOf("on") === 0) {
					var unsub = onEvent(element, name.substring(2), value);
					
					if (!persistent) {
						onUnmount(unsub);
					}
				} else {
					prop(name, value)(element);
				}
				break;
			case "undefined":
				break;
			default:
				element[name] = value;
		}
	}
}

$.bind = bind;

})($);

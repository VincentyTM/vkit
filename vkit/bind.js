(function($) {

var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var prop = $.prop;

function setValue(element, name, value, persistent) {
	if (!persistent) {
		var old = element[name];
		
		onUnmount(function() {
			if (element[name] === value) {
				element[name] = old;
			}
		});
	}
	
	element[name] = value;
}

function bind(element, bindings, persistent) {
	for (var name in bindings) {
		var value = bindings[name];
		
		switch (typeof value) {
			case "object":
				if (!value) {
					setValue(element, name, value, persistent);
				} else if (value.prop) {
					value.prop(name)(element);
				} else {
					var obj = element[name];
					
					if (obj) {
						bind(obj, value, persistent);
					} else {
						setValue(element, name, value, persistent);
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
				setValue(element, name, value, persistent);
		}
	}
}

$.bind = bind;

})($);

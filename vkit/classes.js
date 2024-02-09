(function($) {

var effect = $.effect;
var isArray = $.isArray;
var onUnmount = $.unmount;

function addClass(el, name) {
	if (el.classList) {
		el.classList.add(name);
	} else {
		el.className += " " + name;
	}
}

function removeClass(el, name) {
	if (el.classList) {
		el.classList.remove(name);
	} else {
		el.className = el.className.replace(" " + name, "");
	}
}

function bindClass(el, name, value) {
	if (value && typeof value.effect === "function") {
		value.effect(function(v) {
			v ? addClass(el, name) : removeClass(el, name);
		});
	} else if (value === true) {
		addClass(el, name);
	} else if (value === false) {
		removeClass(el, name);
	} else if (typeof value === "function") {
		effect(function() {
			bindClass(el, name, value());
		});
	}
}

function bindClasses(el, arg, onCleanup) {
	var type = typeof arg;
	
	if (!arg) {
	} else if (isArray(arg)) {
		var n = arg.length;
		
		for (var i = 0; i < n; ++i) {
			bindClasses(el, arg[i], onCleanup);
		}
	} else if (type === "string") {
		addClass(el, arg);
		
		if (onCleanup) {
			onCleanup(function() {
				removeClass(el, arg);
			});
		}
	} else if (typeof arg.effect === "function") {
		arg.effect(function(value, onCleanup) {
			bindClasses(el, value, onCleanup);
		});
	} else if (type === "object") {
		for (var name in arg) {
			bindClass(el, name, arg[name]);
		}
	} else if (type === "function") {
		effect(function() {
			bindClasses(el, arg(), onUnmount);
		});
	}
}

function classes() {
	var args = arguments;
	var n = args.length;
	
	return function(el) {
		for (var i = 0; i < n; ++i) {
			bindClasses(el, args[i]);
		}
	};
}

$.classes = classes;

})($);

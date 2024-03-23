(function($) {

var effect = $.effect;
var isArray = $.isArray;
var isSignal = $.isSignal;
var onUnmount = $.onUnmount;

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
	if (isSignal(value)) {
		value.effect(function(v) {
			v ? addClass(el, name) : removeClass(el, name);
		});
		return;
	}
	
	if (value === true) {
		addClass(el, name);
		return;
	}
	
	if (value === false) {
		removeClass(el, name);
		return;
	}
	
	if (typeof value === "function") {
		effect(function() {
			bindClass(el, name, value());
		});
		return;
	}
}

function bindClasses(el, arg, onCleanup) {
	if (!arg) {
		return;
	}
	
	if (isArray(arg)) {
		var n = arg.length;
		for (var i = 0; i < n; ++i) {
			bindClasses(el, arg[i], onCleanup);
		}
		return;
	}
	
	if (typeof arg === "string") {
		addClass(el, arg);
		if (onCleanup) {
			onCleanup(function() {
				removeClass(el, arg);
			});
		}
		return;
	}
	
	if (isSignal(arg)) {
		arg.effect(function(value, onCleanup) {
			bindClasses(el, value, onCleanup);
		});
		return;
	}
	
	if (typeof arg === "object") {
		for (var name in arg) {
			bindClass(el, name, arg[name]);
		}
		return;
	}
	
	if (typeof arg === "function") {
		effect(function() {
			bindClasses(el, arg(), onUnmount);
		});
		return;
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

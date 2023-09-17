(function($) {

var computed = $.computed;

function is(condition) {
	if (typeof condition !== "function") {
		throw new TypeError("Condition must be a function");
	}
	
	return computed(Boolean, condition)();
}

$.is = is;

})($);

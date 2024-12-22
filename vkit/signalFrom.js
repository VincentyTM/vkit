(function($) {

var computed = $.computed;
var signal = $.signal;
var isSignal = $.isSignal;

function signalFrom(value) {
	return isSignal(value) ? value : (
		typeof value === "function" ? computed(value) : signal(value)
	);
}

$.signalFrom = signalFrom;

})($);

(function($) {

var signal = $.signal;
var isSignal = $.isSignal;

function signalFrom(value) {
	return isSignal(value) ? value : signal(value);
}

$.signalFrom = signalFrom;
$.stateFrom = signalFrom;

})($);

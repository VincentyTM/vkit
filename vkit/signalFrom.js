(function($){

var createSignal = $.signal;
var isSignal = $.isSignal;

function signalFrom(value){
	return isSignal(value) ? value : createSignal(value);
}

$.signalFrom = signalFrom;
$.stateFrom = signalFrom;

})($);

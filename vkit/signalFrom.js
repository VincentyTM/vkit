(function($){

var createSignal = $.signal;

function isSignal(value){
	return !!(value && typeof value.effect === "function" && typeof value.get === "function");
}

function signalFrom(value){
	return isSignal(value) ? value : createSignal(value);
}

$.isSignal = isSignal;
$.signalFrom = signalFrom;
$.stateFrom = signalFrom;

})($);

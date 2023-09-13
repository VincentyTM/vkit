(function($){

var isSignal = $.isSignal;

function get(signalOrValue){
	return isSignal(signalOrValue) ? signalOrValue.get() : signalOrValue;
}

$.get = get;

})($);

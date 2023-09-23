(function($){

function isSignal(value){
	return !!(value && value.isSignal === true);
}

$.isSignal = isSignal;

})($);

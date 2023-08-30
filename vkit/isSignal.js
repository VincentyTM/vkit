(function($){

function isSignal(value){
	return !!(value && typeof value.effect === "function" && typeof value.get === "function");
}

$.isSignal = isSignal;

})($);

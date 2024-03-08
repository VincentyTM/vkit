(function($) {

function isWritableSignal(value) {
	return !!(value && value.isSignal === true && value.set);
}

$.isWritableSignal = isWritableSignal;

})($);

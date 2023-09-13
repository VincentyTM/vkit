(function($, undefined) {

var onError = $.onError;
var signal = $.signal;
var update = $.update;
var view = $.view;

function errorBoundary(getView, getFallbackView) {
	if (typeof getFallbackView !== "function" && getFallbackView !== undefined) {
		throw new TypeError("Error boundary fallback must be a function");
	}
	
	var error;
	var failed = signal(false);
	
	return failed.view(function(hasFailed) {
		if (hasFailed) {
			return getFallbackView ? getFallbackView(error) : null;
		}
		
		onError(function(ex) {
			error = ex;
			failed.set(true);
			update();
		});
		
		try {
			return getView();
		} catch(ex) {
			error = ex;
			failed.set(true);
			update();
		}
	});
}

$.errorBoundary = errorBoundary;

})($);

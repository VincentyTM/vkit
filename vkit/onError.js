(function($) {

var getComponent = $.getComponent;
var observable = $.observable;
var onUnmount = $.onUnmount;

function onError(errorHandler) {
	var component = getComponent();
	
	if (!component.emitError) {
		component.emitError = observable();
	}
	
	var unsubscribe = component.emitError.subscribe(errorHandler);
	
	onUnmount(function() {
		unsubscribe();
		
		if (component.emitError.count() === 0) {
			component.emitError = null;
		}
	});
}

$.onError = onError;

})($);

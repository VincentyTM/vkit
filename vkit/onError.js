(function($){

var createObservable = $.observable;
var getComponent = $.getComponent;
var onUnmount = $.onUnmount;

function onError(errorHandler){
	var component = getComponent();
	
	if(!component.emitError){
		component.emitError = createObservable();
	}
	
	var unsubscribe = component.emitError.subscribe(errorHandler);
	
	onUnmount(function() {
		unsubscribe();
		
		if( component.emitError.count() === 0 ){
			component.emitError = null;
		}
	});
}

$.onError = onError;

})($);

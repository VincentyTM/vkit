(function($){

var unmount = $.unmount;
var createObservable = $.observable;
var getComponent = $.getComponent;

function onError(errorHandler){
	var component = getComponent();
	
	if(!component.emitError){
		component.emitError = createObservable();
	}
	
	var unsubscribe = component.emitError.subscribe(errorHandler);
	
	unmount(function(){
		unsubscribe();
		
		if( component.emitError.count() === 0 ){
			component.emitError = null;
		}
	});
}

$.onError = onError;

})($);

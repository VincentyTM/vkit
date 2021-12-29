(function($){

var unmount = $.unmount;
var createObservable = $.observable;
var getCurrentComponent = $.component;

function onError(errorHandler){
	var component = getCurrentComponent();
	if(!component.onError){
		component.onError = createObservable();
	}
	var unsubscribe = component.onError.subscribe(errorHandler);
	unmount(function(){
		unsubscribe();
		if( component.onError.count() === 0 ){
			component.onError = null;
		}
	});
}

$.onError = onError;

})($);

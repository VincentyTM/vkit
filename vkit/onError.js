(function($){

var unmount = $.unmount;
var createObservable = $.observable;
var getComponent = $.getComponent;

function onError(errorHandler){
	var component = getComponent();
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

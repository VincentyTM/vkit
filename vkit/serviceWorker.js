(function($, navigator){

var createState = $.state;
var render = $.render;

function createServiceWorker(src, options, onError, nav){
	if(!nav){
		nav = navigator;
	}
	
	var registration = createState(null);
	
	if( nav.serviceWorker && typeof nav.serviceWorker.register === "function" ){
		nav.serviceWorker.register(src, options).then(function(reg){
			registration.set(reg);
			render();
		}, function(error){
			if( typeof onError === "function" ){
				onError(error);
			}
			render();
		});
	}else if( typeof onError === "function" ){
		onError(new Error("ServiceWorker API is not supported"));
	}
	
	return registration.map();
}

$.serviceWorker = createServiceWorker;

})($, navigator);

(function($){

var createSignal = $.signal;
var getWindow = $.window;
var update = $.update;

function createServiceWorker(src, options, onError, nav){
	if(!nav){
		nav = getWindow().navigator;
	}
	
	var registration = createSignal(null);
	
	if( nav.serviceWorker && typeof nav.serviceWorker.register === "function" ){
		nav.serviceWorker.register(src, options).then(function(reg){
			registration.set(reg);
			update();
		}, function(error){
			if( typeof onError === "function" ){
				onError(error);
			}
			
			update();
		});
	}else if( typeof onError === "function" ){
		onError(new Error("ServiceWorker API is not supported"));
	}
	
	return registration.map();
}

$.serviceWorker = createServiceWorker;

})($);

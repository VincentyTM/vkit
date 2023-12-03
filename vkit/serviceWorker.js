(function($) {

var getWindow = $.window;
var signal = $.signal;
var update = $.update;

function serviceWorker(src, options, onError) {
	var nav = getWindow().navigator;
	var registration = signal(null);
	
	if (nav.serviceWorker && typeof nav.serviceWorker.register === "function") {
		nav.serviceWorker.register(src, options).then(function(reg) {
			registration.set(reg);
			update();
		}, function(error) {
			if (typeof onError === "function") {
				onError(error);
			}
			
			update();
		});
	} else if (typeof onError === "function") {
		onError(new Error("ServiceWorker API is not supported"));
	}
	
	return registration.map();
}

$.serviceWorker = serviceWorker;

})($);

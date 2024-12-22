(function($) {

var getWindow = $.getWindow;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function serviceWorker(src, options) {
	var nav = getWindow().navigator;
	var error = signal(null);
	var registration = signal(null);
	
	if (nav.serviceWorker && typeof nav.serviceWorker.register === "function") {
		nav.serviceWorker.register(src, options).then(function(reg) {
			registration.set(reg);
			update();
		}, function(ex) {
			error.set(ex);
			update();
		});
	} else {
		error.set(new Error("ServiceWorker API is not supported"));
	}
	
	var result = readOnly(registration);
	result.onError = error.subscribe;
	return result;
}

$.serviceWorker = serviceWorker;

})($);

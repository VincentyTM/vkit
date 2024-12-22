(function($) {

var getWindow = $.getWindow;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function mediaDevices() {
	var nav = getWindow().navigator;
	var devices = signal([]);
	var error = signal(null);
	
	function fetchDevices() {
		nav.mediaDevices.enumerateDevices().then(function(list) {
			devices.set(list);
			update();
		}, function(ex) {
			error.set(ex);
			update();
		});
	}
	
	if (nav.mediaDevices && typeof nav.mediaDevices.enumerateDevices === "function") {
		onUnmount(
			onEvent(nav.mediaDevices, "devicechange", fetchDevices)
		);
		fetchDevices();
	} else {
		error.set(new Error("MediaDevices API is not supported"));
	}
	
	var result = readOnly(devices);
	result.onError = error.subscribe;
	return result;
}

$.mediaDevices = mediaDevices;

})($);

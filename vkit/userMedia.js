(function($) {

var effect = $.effect;
var getWindow = $.getWindow;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function getUserMedia(constraints, displayMedia) {
	var nav = getWindow().navigator;
	var error = signal(null);
	var pending = signal(false);
	var result = signal(null);
	
	function setConstraints(constraints) {
		var stream = result.get();
		
		if (stream) {
			stream.getTracks().forEach(function(track) {
				track.stop();
			});
			result.set(null);
		}
		
		if (constraints) {
			if(
				!nav.mediaDevices ||
				(!displayMedia && typeof nav.mediaDevices.getUserMedia !== "function") ||
				(displayMedia && typeof nav.mediaDevices.getDisplayMedia !== "function")
			) {
				error.set(new Error("MediaDevices API is not supported"));
				return;
			}
			
			pending.set(true);
			
			var media = displayMedia
				? nav.mediaDevices.getDisplayMedia(constraints)
				: nav.mediaDevices.getUserMedia(constraints);
			
			media.then(function(stream) {
				result.set(stream);
				pending.set(false);
				update();
			}, function(ex) {
				pending.set(false);
				error.set(ex);
				update();
			});
		}
	}
	
	if (typeof constraints === "function") {
		if (typeof constraints.effect === "function") {
			constraints.effect(setConstraints);
		} else {
			effect(function() {
				setConstraints(constraints());
			});
		}
	} else {
		setConstraints(constraints);
	}
	
	onUnmount(function() {
		setConstraints(null);
	});
	
	var userMedia = readOnly(result);
	userMedia.onError = error.subscribe;
	userMedia.pending = readOnly(pending);
	return userMedia;
}

$.userMedia = getUserMedia;

})($);

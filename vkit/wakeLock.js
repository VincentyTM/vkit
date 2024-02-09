(function($, navigator) {

var onUnmount = $.onUnmount;
var signal = $.signal;
var update = $.update;

function wakeLock(controller) {
	var currentSentinel = signal(null);
	var isPending = false;
	
	function lock() {
		if (navigator.wakeLock && !isPending && !currentSentinel.get()) {
			isPending = true;
			
			navigator.wakeLock.request("screen").then(function(sentinel) {
				isPending = false;
				
				if (!sentinel.released) {
					sentinel.onrelease = function() {
						currentSentinel.set(null);
						update();
					};
					
					currentSentinel.set(sentinel);
					update();
				}
			}, function(err) {
				isPending = false;
				currentSentinel.set(null);
				update();
			});
		}
	}
	
	function unlock() {
		var sentinel = currentSentinel.get();
		
		if (sentinel && !isPending) {
			isPending = true;
			
			sentinel.release().then(function() {
				isPending = false;
				currentSentinel.set(null);
				update();
			}, function() {
				isPending = false;
			});
		}
	}
	
	if (controller && typeof controller.effect === "function") {
		controller.map(Boolean).effect(function(doLock) {
			doLock ? lock() : unlock();
		});
	} else {
		lock();
	}
	
	onUnmount(unlock);
	
	return currentSentinel.map(Boolean);
}

$.wakeLock = wakeLock;

})($, navigator);

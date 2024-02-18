(function($, undefined) {

var computed = $.computed;
var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var signal = $.signal;

function getInstalling(reg) {
	return reg ? reg.installing : null;
}

function createUpdatePrompt(serviceWorker, message, win) {
	if(!win){
		win = getWindow();
	}
	
	var updatePrompt = signal(null);
	var refreshing = false;
	
	function reset() {
		updatePrompt.set(null);
	}
	
	function showPrompt(reg) {
		function accept() {
			updatePrompt.set(null);
			
			if (reg.waiting) {
				reg.waiting.postMessage(
					typeof message === "function"
						? message()
						: message === undefined
							? "skipWaiting"
							: message
				);
			}
		}
		
		updatePrompt.set({
			accept: accept,
			deny: reset
		});
	}
	
	if (win.navigator.serviceWorker) {
		onUnmount(
			onEvent(win.navigator.serviceWorker, "controllerchange", function() {
				if (!refreshing) {
					refreshing = true;
					win.location.reload();
				}
			})
		);
	}
	
	var regInstalling = computed(getInstalling, [serviceWorker]);
	
	regInstalling.effect(function(installing, onCleanup) {
		if (installing) {
			var reg = serviceWorker.get();
			
			onCleanup(
				onEvent(installing, "statechange", function() {
					if (this.state === "installed") {
						showPrompt(reg);
					}
				})
			);
		}
	});
	
	serviceWorker.effect(function(reg, onCleanup) {
		if (!reg) {
			return;
		}
		
		var awaitStateChange = regInstalling.invalidate;
		
		if (reg.waiting) {
			showPrompt(reg);
		} else {
			if (reg.installing) {
				awaitStateChange();
			}
			
			onCleanup(
				onEvent(reg, "updatefound", awaitStateChange)
			);
		}
	});
	
	return updatePrompt.map();
}

$.updatePrompt = createUpdatePrompt;

})($);

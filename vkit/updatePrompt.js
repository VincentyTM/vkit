(function($, undefined){

var createSignal = $.signal;
var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.unmount;

function createUpdatePrompt(serviceWorker, message, win){
	if(!win){
		win = getWindow();
	}
	
	var updatePrompt = createSignal(null);
	var refreshing = false;
	
	function reset(){
		updatePrompt.set(null);
	}
	
	function showPrompt(reg){
		function accept(){
			updatePrompt.set(null);
			
			if( reg.waiting ){
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
	
	if( win.navigator.serviceWorker ){
		onUnmount(
			onEvent(win.navigator.serviceWorker, "controllerchange", function(){
				if(!refreshing){
					refreshing = true;
					win.location.reload();
				}
			})
		);
	}
	
	serviceWorker.effect(function(reg, onCleanup){
		if(!reg){
			return;
		}
		
		function awaitStateChange(){
			if( reg.installing ){
				onCleanup(
					onEvent(reg.installing, "statechange", function(){
						if( this.state === "installed" ){
							showPrompt(reg);
						}
					})
				);
			}
		}
		
		if( reg.waiting ){
			showPrompt(reg);
		}else{
			if( reg.installing ){
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

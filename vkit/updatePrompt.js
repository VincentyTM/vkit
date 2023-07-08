(function($, window, undefined){

var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;
var update = $.update;

function createUpdatePrompt(serviceWorker, message, win){
	if(!win){
		win = window;
	}
	
	var updatePrompt = createState(null);
	var refreshing = false;
	
	function reset(){
		updatePrompt.set(null);
	}
	
	function showPrompt(reg){
		function update(){
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
			accept: update,
			deny: reset
		});
		update();
	}
	
	if( win.navigator.serviceWorker ){
		unmount(
			onEvent(win.navigator.serviceWorker, "controllerchange", function(){
				if(!refreshing){
					refreshing = true;
					win.location.reload();
				}
			})
		);
	}
	
	serviceWorker.effect(function(reg, cleanup){
		if(!reg){
			return;
		}
		
		function awaitStateChange(){
			if( reg.installing ){
				cleanup(
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
			
			cleanup(
				onEvent(reg, "updatefound", awaitStateChange)
			);
		}
	});
	
	return updatePrompt.map();
}

$.updatePrompt = createUpdatePrompt;

})($, window);

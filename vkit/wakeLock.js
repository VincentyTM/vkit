(function($, navigator){

var render = $.render;
var createState = $.state;
var unmount = $.unmount;

function wakeLock(controller){
	var currentSentinel = createState(null);
	var isPending = false;
	
	function lock(){
		if( navigator.wakeLock && !isPending && !currentSentinel.get() ){
			isPending = true;
			navigator.wakeLock.request("screen").then(function(sentinel){
				isPending = false;
				if(!sentinel.released){
					sentinel.onrelease = function(){
						currentSentinel.set(null);
						render();
					};
					currentSentinel.set(sentinel);
					render();
				}
			}, function(err){
				isPending = false;
				currentSentinel.set(null);
				render();
			});
		}
	}
	
	function unlock(){
		var sentinel = currentSentinel.get();
		if( sentinel && !isPending ){
			isPending = true;
			sentinel.release().then(function(){
				isPending = false;
				currentSentinel.set(null);
				render();
			}, function(){
				isPending = false;
			});
		}
	}
	
	if( controller && typeof controller.effect === "function" ){
		controller.map(Boolean).effect(function(doLock){
			doLock ? lock() : unlock();
		});
	}else{
		lock();
	}
	
	unmount(unlock);
	
	return currentSentinel.map(Boolean);
}

$.wakeLock = wakeLock;

})($, navigator);

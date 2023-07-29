(function($){

var createSignal = $.signal;
var update = $.update;

function awaitPromise(promiseOrSignal){
	var result = createSignal();
	var lastPromise = null;
	
	function setPromise(promise){
		result.set({
			pending: true
		});
		
		if( promise && typeof promise.then === "function" ){
			lastPromise = promise;
			
			promise.then(function(value){
				if( promise === lastPromise ){
					result.set({
						fulfilled: true,
						value: value
					});
					update();
				}
			}, function(error){
				if( promise === lastPromise ){
					result.set({
						rejected: true,
						error: error
					});
					update();
				}
			});
		}else{
			lastPromise = null;
		}
	}
	
	if( promiseOrSignal.effect ){
		promiseOrSignal.effect(setPromise);
	}else{
		setPromise(promiseOrSignal);
	}
	
	var output = result.map();
	
	return output;
}

$.await = awaitPromise;

})($);

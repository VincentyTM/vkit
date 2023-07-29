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
	
	output.then = function(fulfilled, rejected, pending){
		return output.view(function(data){
			if( data.fulfilled && typeof fulfilled === "function" ){
				return fulfilled(data.value);
			}
			
			if( data.rejected && typeof rejected === "function" ){
				return rejected(data.error);
			}
			
			if( data.pending && typeof pending === "function" ){
				return pending();
			}
		});
	};
	
	return output;
}

$.await = awaitPromise;

})($);

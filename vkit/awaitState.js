(function($){

var createState = $.state;
var update = $.update;

function awaitState(promiseOrState){
	var state = createState();
	var lastPromise = null;
	
	function setPromise(promise){
		state.set({pending: true});
		
		if( promise && typeof promise.then === "function" ){
			lastPromise = promise;
			
			promise.then(function(value){
				if( promise === lastPromise ){
					state.set({fulfilled: true, value: value});
					update();
				}
			}, function(error){
				if( promise === lastPromise ){
					state.set({rejected: true, error: error});
					update();
				}
			});
		}else{
			lastPromise = null;
		}
	}
	
	if( promiseOrState.effect ){
		promiseOrState.effect(setPromise);
	}else{
		setPromise(promiseOrState);
	}
	
	return state;
}

$.awaitState = awaitState;

})($);

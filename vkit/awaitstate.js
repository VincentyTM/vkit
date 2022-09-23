(function($){

var createState = $.state;
var render = $.render;

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
					render();
				}
			}, function(error){
				if( promise === lastPromise ){
					state.set({rejected: true, error: error});
					render();
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

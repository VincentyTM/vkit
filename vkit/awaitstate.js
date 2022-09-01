(function($){

var createState = $.state;
var render = $.render;

function awaitState(promiseOrState){
	var state = createState();
	var lastPromise;
	function setPromise(promise){
		lastPromise = promise;
		state.set({pending: true});
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

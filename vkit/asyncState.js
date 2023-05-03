(function($){

var createState = $.state;
var render = $.render;

function createAsyncState(input, callAsync, onError, getInitialValue){
	var isFunction = typeof getInitialValue === "function";
	var pending = createState(false);
	var result = createState(isFunction ? getInitialValue() : getInitialValue);
	var queued = false;
	
	function stop(){
		pending.set(false);
		if( queued ){
			queued = false;
			start(input && typeof input.get === "function" ? input.get() : input);
		}
	}
	
	function start(inputValue){
		if( pending.get() ){
			queued = true;
			return;
		}
		
		pending.set(true);
		result.set(isFunction ? getInitialValue() : getInitialValue);
		
		try{
			var returnValue = callAsync(inputValue);
			if( returnValue && typeof returnValue.then === "function" ){
				returnValue.then(function(outputValue){
					result.set(outputValue);
					stop();
					render();
				}, function(error){
					if( typeof onError === "function" ){
						onError(error);
					}
					stop();
					render();
				});
			}else{
				result.set(returnValue);
				stop();
			}
		}catch(error){
			if( typeof onError === "function" ){
				onError(error);
			}
			stop();
		}
	}
	
	if( input && typeof input.effect === "function" ){
		input.effect(start);
	}else{
		start(input);
	}

	var output = result.map();
	output.pending = pending.map();
	return output;
}

$.asyncState = createAsyncState;

})($);

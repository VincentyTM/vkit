(function($){

var onEvent = $.onEvent;
var unmount = $.unmount;

function createEventPipe(type, state, transform){
	function updateValue(value){
		if( typeof transform === "function" ){
			value = transform(value);
		}
		state.set(value);
	}
	
	return function(target){
		unmount(onEvent(target, type, updateValue));
	};
}

$.eventPipe = createEventPipe;

})($);

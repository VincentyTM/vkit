(function($){

var onEvent = $.onEvent;
var unmount = $.unmount;

function createEventPipe(type, state){
	function updateValue(value){
		state.set(value);
	}
	
	return function(target){
		unmount(onEvent(target, type, updateValue));
	};
}

$.eventPipe = createEventPipe;

})($);

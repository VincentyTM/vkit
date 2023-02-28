(function($){

var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;

function createEventState(target, eventType, defaultValue){
	var state = createState(defaultValue);
	
	function setter(e){
		state.set(e);
	}
	
	unmount(onEvent(target, eventType, setter));
	return state.map();
}

$.eventState = createEventState;

})($);

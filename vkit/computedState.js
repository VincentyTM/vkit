(function($){

var createState = $.state;

function createComputedState(getter, updater){
	var state = createState(getter());
	updater(function(){
		state.set(getter());
	});
	return state.map();
}

$.computedState = createComputedState;

})($);

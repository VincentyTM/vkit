(function($){

var createState = $.state;
var getComponent = $.getComponent;
var setComponent = $.setComponent;

function createComputedState(getter, updater){
	var prev = getComponent();
	setComponent(null);
	var state = createState(getter());
	getComponent(prev);
	updater(function(){
		state.set(getter());
	});
	return state.map();
}

$.computedState = createComputedState;

})($);

(function($){

var createState = $.state;
var getComponent = $.getComponent;
var setComponent = $.setComponent;

function createComputedState(getter, updater){
	var prev = getComponent();
	setComponent(null);
	var state = createState(getter());
	setComponent(prev);
	
	var readOnly = state.map();
	var u = readOnly.update;
	
	function update(){
		state.set(getter());
		u();
	}
	
	updater(update);
	readOnly.update = update;
	
	return readOnly;
}

$.computedState = createComputedState;

})($);

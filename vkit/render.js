(function($){

var renderComponentTree = $.renderComponents;
var renderStates = $.renderStates;
var stateUpdates = $.stateUpdateQueue;
var callTicks = $.callTicks;

function render(){
	var n = stateUpdates.length;
	do{
		if( n ){
			renderStates();
		}
		renderComponentTree();
		n = stateUpdates.length;
	}while(n);
	callTicks();
}

$.render = render;

})($);

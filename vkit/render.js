(function($){

var rootComponent = $.rootComponent;
var renderStates = $.renderStates;
var stateUpdates = $.stateUpdateQueue;
var callTicks = $.callTicks;

function render(){
	var n = stateUpdates.length;
	do{
		if( n ){
			renderStates();
		}
		rootComponent.render();
		n = stateUpdates.length;
	}while(n);
	callTicks();
}

$.render = render;

})($);

(function($){

var renderComponentTree = $.renderComponents;
var renderStates = $.renderStates;
var stateUpdates = $.stateUpdateQueue;
var afterRender = [];

function addAfterRender(func){
	afterRender.push(func);
}

function callAfterRender(){
	var n = afterRender.length;
	if( n ){
		var updates = afterRender.splice(0, n);
		for(var i=0; i<n; ++i){
			updates[i]();
		}
	}
}

function render(){
	var n = stateUpdates.length;
	do{
		if( n ){
			renderStates();
		}
		renderComponentTree();
		n = stateUpdates.length;
	}while(n);
	callAfterRender();
}

$.render = render;
$.tick = addAfterRender;

})($);

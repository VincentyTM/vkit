(function($){

var renderComponentTree = $.component.render;
var renderStates = $.state.render;
var stateUpdates = $.state.updateQueue;
var afterRender = [];

function addAfterRender(func){
	return afterRender.push(func);
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

function on(type, action){
	return function(element){
		element["on" + type] = function(){
			var ret = action.apply(this, arguments);
			render();
			return ret;
		};
	};
}

$.afterRender = addAfterRender;
$.render = render;
$.on = on;

})($);

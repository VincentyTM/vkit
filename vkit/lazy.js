(function($){

var render = $.render;
var createState = $.state;
var createScript = $.script;

function call(component){
	return typeof component === "function" ? component() : component;
}

function emptyComponent(){
	return null;
}

function lazyComponent(promise, pendingComponent, errorComponent){
	if(!errorComponent) errorComponent = emptyComponent;
	var state = createState(pendingComponent || emptyComponent);
	function onLoad(successComponent){
		state.set(successComponent);
		render();
	}
	function onError(ex){
		state.set(function(){ return errorComponent(ex) });
		render();
	}
	(promise && typeof promise.then === "function" ? promise : createScript(promise)).then(onLoad, onError);
	return state.view(call);
}

$.lazy = lazyComponent;

})($);

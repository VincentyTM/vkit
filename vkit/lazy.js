(function($){

var createScript = $.script;
var createState = $.state;
var unmount = $.unmount;
var update = $.update;

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
		update();
	}
	
	function onError(ex){
		state.set(function(){ return errorComponent(ex) });
		update();
	}
	
	if( typeof promise === "function" ){
		var timeout = setTimeout(function(){
			onLoad(promise);
		}, 0);
		
		unmount(function(){
			clearTimeout(timeout);
		});
	}else{
		(promise && typeof promise.then === "function" ? promise : createScript(promise)).then(onLoad, onError);
	}
	
	return state.view(call);
}

$.lazy = lazyComponent;

})($);

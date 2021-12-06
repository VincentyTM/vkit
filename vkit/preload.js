(function($){

var render = $.render;
var createState = $.state;
var createScript = $.script;

function call(data){
	return data[0].apply(null, data[1]);
}

function emptyComponent(){
	return null;
}

function preloadComponent(promise, pendingComponent, errorComponent){
	if(!pendingComponent) pendingComponent = emptyComponent;
	if(!errorComponent) errorComponent = emptyComponent;
	if(!promise || typeof promise.then !== "function"){
		promise = createScript(promise);
	}
	var successComponent = null;
	promise.then(function(component){
		successComponent = component;
	});
	return function(){
		if( successComponent ){
			return successComponent.apply(null, arguments);
		}
		var args = arguments;
		var state = createState([pendingComponent, []]);
		function onLoad(component){
			state.set([component, args]);
			render();
		}
		function onError(ex){
			state.set([errorComponent, [ex]]);
			render();
		}
		promise.then(onLoad, onError);
		return state.view(call);
	};
}

$.preload = preloadComponent;

})($);

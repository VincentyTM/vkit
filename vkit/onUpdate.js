(function($){

function onUpdate(callback, component){
	while( component && !component.shouldUpdate ){
		component.shouldUpdate = true;
		component = component.parent;
	}
	
	return component.emitUpdate.subscribe(callback);
}

$.onUpdate = onUpdate;

})($);

(function($){

var createObservable = $.observable;
var getComponent = $.getComponent;
var noop = $.noop;

function onUnmount(callback, component){
	if(!callback){
		component = getComponent();
		
		return function(callback){
			return onUnmount(callback, component);
		};
	}
	
	if(!component){
		component = getComponent();
	}
	
	var c = component;
	
	while(!c.unmount && c.parent){
		var unmount = c.unmount = createObservable();
		c = c.parent;
		
		if( c.unmount ){
			c.unmount.subscribe(unmount);
		}
	}
	
	var unmount = component.unmount;
	
	if(!unmount){
		return noop;
	}
	
	return unmount.subscribe(callback);
}

$.unmount = onUnmount;

})($);

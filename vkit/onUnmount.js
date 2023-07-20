(function($){

var createObservable = $.observable;
var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var noop = $.noop;
var rootComponent = $.rootComponent;

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
	
	if( component === rootComponent ){
		return noop;
	}
	
	var c = component;
	
	while( c && !c.unmount ){
		c.unmount = createObservable();
		
		if( c.parent ){
			if( c.parent.children ){
				c.parent.children.push(c);
			}else{
				c.parent.children = [c];
			}
		}
		
		c = c.parent;
	}
	
	return component.unmount.subscribe(callback);
}

$.onUnmount = onUnmount;
$.unmount = onUnmount;

})($);

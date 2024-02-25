(function($) {

var getComponent = $.getComponent;
var noop = $.noop;
var observable = $.observable;
var rootComponent = $.rootComponent;

function onUnmount(callback, component) {
	if (!component) {
		component = getComponent();
	}
	
	if (component === rootComponent) {
		return noop;
	}
	
	var c = component;
	
	while (c && !c.unmount) {
		c.unmount = observable();
		
		if (c.parent) {
			if (c.parent.children) {
				c.parent.children.push(c);
			} else {
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

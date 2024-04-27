(function($, undefined) {

var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var getInjector = $.getInjector;
var setComponent = $.setComponent;
var setInjector = $.setInjector;
var throwError = $.throwError;

function createComponent(mount, parent, injector) {
	var isRendering = false;
	
	var component = {
		children: null,
		emitError: null,
		parent: parent === undefined ? getComponent() : parent,
		render: renderComponent,
		stack: new Error().stack,
		unmount: null
	};
	
	if (injector === undefined) {
		injector = getInjector();
	}
	
	function renderComponent() {
		if (isRendering) {
			throwError(new Error("Circular dependency detected"), component.parent);
		}
		
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try {
			isRendering = true;
			setComponent(null);
			emitUnmount(component);
			setComponent(component);
			setInjector(injector);
			mount();
		} catch (error) {
			throwError(error, component);
		} finally {
			setComponent(prevComponent);
			setInjector(prevInjector);
			isRendering = false;
		}
	}
	
	return component;
}

$.component = createComponent;
$.createComponent = createComponent;

})($);

(function($, undefined) {

var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var getInjector = $.getInjector;
var setComponent = $.setComponent;
var setInjector = $.setInjector;
var throwError = $.throwError;

function createComponent(mount, parent, injector) {
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
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try {
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
		}
	}
	
	return component;
}

$.component = createComponent;
$.createComponent = createComponent;

})($);

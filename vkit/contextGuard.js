(function($) {

var currentComponent = null;
var currentInjector = null;
var errorMessage = "This function can only be called synchronously from a component";

function getComponent(allowNull) {
	if (!allowNull && !currentComponent) {
		throw new Error(errorMessage);
	}
	
	return currentComponent;
}

function setComponent(component) {
	currentComponent = component;
}

function getInjector(allowNull) {
	if (!allowNull && (!currentComponent || !currentInjector)) {
		throw new Error(errorMessage);
	}
	
	return currentInjector;
}

function setInjector(injector) {
	currentInjector = injector;
}

$.getComponent = getComponent;
$.getInjector = getInjector;
$.setComponent = setComponent;
$.setInjector = setInjector;

})($);

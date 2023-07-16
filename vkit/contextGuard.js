(function($, document){

var currentComponent = null;
var currentProvider = null;

function contextGuard(allowNull){
	if(!allowNull && !currentComponent){
		throw new Error("This function can only be called synchronously from a component");
	}
}

function getComponent(allowNull){
	contextGuard(allowNull);
	return currentComponent;
}

function setComponent(component){
	currentComponent = component;
}

function getProvider(allowNull){
	contextGuard(allowNull);
	return currentProvider;
}

function setProvider(provider){
	currentProvider = provider;
}

$.getComponent = getComponent;
$.getProvider = getProvider;
$.setComponent = setComponent;
$.setProvider = setProvider;

})($, document);

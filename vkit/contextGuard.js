(function($){

var currentComponent = null;
var currentProvider = null;
var errorMessage = "This function can only be called synchronously from a component";

function getComponent(allowNull){
	if(!allowNull && !currentComponent){
		throw new Error(errorMessage);
	}
	
	return currentComponent;
}

function setComponent(component){
	currentComponent = component;
}

function getProvider(allowNull){
	if(!allowNull && (!currentComponent || !currentProvider)){
		throw new Error(errorMessage);
	}
	
	return currentProvider;
}

function setProvider(provider){
	currentProvider = provider;
}

$.getComponent = getComponent;
$.getProvider = getProvider;
$.setComponent = setComponent;
$.setProvider = setProvider;

})($);

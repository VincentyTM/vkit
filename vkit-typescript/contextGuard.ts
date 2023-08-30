import type {Component} from "./component";
import type {Provider} from "./inject";

var currentComponent: Component | null = null;
var currentProvider: Provider | null = null;
var errorMessage = "This function can only be called synchronously from a component";

function getComponent(allowNull?: boolean){
	if(!allowNull && !currentComponent){
		throw new Error(errorMessage);
	}
	
	return currentComponent;
}

function setComponent(component: Component | null){
	currentComponent = component;
}

function getProvider(allowNull?: boolean){
	if(!allowNull && (!currentComponent || !currentProvider)){
		throw new Error(errorMessage);
	}
	
	return currentProvider;
}

function setProvider(provider: Provider | null){
	currentProvider = provider;
}

export {
	getComponent,
	getProvider,
	setComponent,
	setProvider
};

import type {Component} from "./component";
import type {Injector} from "./injector";

var currentComponent: Component | null = null;
var currentInjector: Injector | null = null;
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

function getInjector(allowNull?: boolean){
	if(!allowNull && (!currentComponent || !currentInjector)){
		throw new Error(errorMessage);
	}
	
	return currentInjector;
}

function setInjector(injector: Injector | null){
	currentInjector = injector;
}

export {
	getComponent,
	getInjector,
	setComponent,
	setInjector
};

import type {Component} from "./createComponent.js";
import type {Injector} from "./injector.js";

var currentComponent: Component | null = null;
var currentInjector: Injector | null = null;
var errorMessage = "This function can only be called synchronously from a component";

export function getComponent(): Component;

export function getComponent(allowNull: true): Component | null;

export function getComponent(allowNull?: boolean): Component | null {
	if (!allowNull && !currentComponent) {
		throw new Error(errorMessage);
	}
	return currentComponent;
}

export function setComponent(component: Component | null): void {
	currentComponent = component;
}

export function getInjector(): Injector;

export function getInjector(allowNull: true): Injector | null;

export function getInjector(allowNull?: boolean): Injector | null {
	if (!allowNull && (!currentComponent || !currentInjector)) {
		throw new Error(errorMessage);
	}
	return currentInjector;
}

export function setInjector(injector: Injector | null) {
	currentInjector = injector;
}

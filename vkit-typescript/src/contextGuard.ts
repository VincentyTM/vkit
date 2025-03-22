import { Effect } from "./createEffect.js";
import { Injector } from "./createInjector.js";

var currentEffect: Effect | undefined;
var currentInjector: Injector | undefined;
var errorMessage = "This function can only be called synchronously from a reactive context";

export function getEffect(): Effect;

export function getEffect(doNotThrow: true): Effect | undefined;

export function getEffect(doNotThrow?: boolean): Effect | undefined {
	if (!doNotThrow && !currentEffect) {
		throw new Error(errorMessage);
	}
	return currentEffect;
}

export function setEffect(effect: Effect | undefined): void {
	currentEffect = effect;
}

export function getInjector(): Injector;

export function getInjector(doNotThrow: true): Injector | undefined;

export function getInjector(doNotThrow?: boolean): Injector | undefined {
	if (!doNotThrow && (!currentEffect || !currentInjector)) {
		throw new Error(errorMessage);
	}
	return currentInjector;
}

export function setInjector(injector: Injector | undefined): void {
	currentInjector = injector;
}

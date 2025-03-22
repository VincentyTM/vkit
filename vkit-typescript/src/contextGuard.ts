import { Effect } from "./createEffect.js";
import { Injector } from "./createInjector.js";

var currentEffect: Effect | null = null;
var currentInjector: Injector | null = null;
var errorMessage = "This function can only be called synchronously from a reactive context";

export function getEffect(): Effect;

export function getEffect(allowNull: true): Effect | null;

export function getEffect(allowNull?: boolean): Effect | null {
	if (!allowNull && !currentEffect) {
		throw new Error(errorMessage);
	}
	return currentEffect;
}

export function setEffect(effect: Effect | null): void {
	currentEffect = effect;
}

export function getInjector(): Injector;

export function getInjector(allowNull: true): Injector | null;

export function getInjector(allowNull?: boolean): Injector | null {
	if (!allowNull && (!currentEffect || !currentInjector)) {
		throw new Error(errorMessage);
	}
	return currentInjector;
}

export function setInjector(injector: Injector | null): void {
	currentInjector = injector;
}

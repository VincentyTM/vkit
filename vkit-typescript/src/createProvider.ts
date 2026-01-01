import { Effect } from "./createEffect.js";
import { Injectable } from "./createInjectable.js";

export interface Provider<T> {
	readonly effect: Effect;
	readonly injectable: Injectable<T>;
	instance: T | undefined;
	isCreated: boolean;
	isCreating: boolean;
}

export function createProvider<T>(
	injectable: Injectable<T>,
	effect: Effect
): Provider<T> {
	return {
		effect: effect,
		injectable: injectable,
		instance: undefined,
		isCreated: false,
		isCreating: false
	};
}

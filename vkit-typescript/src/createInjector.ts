import { Injectable } from "./createInjectable.js";
import { Provider } from "./createProvider.js";
import { createWeakMapPolyfill, WeakMapLike } from "./createWeakMapPolyfill.js";

export interface Injector {
	readonly allowMissingProvider: boolean;
	readonly providers: WeakMapLike<Injectable<unknown>, Provider<unknown>>;
}

export function createInjector(allowMissingProvider: boolean): Injector {
	return {
		allowMissingProvider: allowMissingProvider,
		providers: typeof WeakMap === "function" ? new WeakMap() : createWeakMapPolyfill()
	};
}

import { Injectable } from "./createInjectable.js";
import { Provider } from "./createProvider.js";
import { createWeakMapPolyfill, WeakMapLike } from "./createWeakMapPolyfill.js";

export interface Injector {
	readonly allowMissingProvider: boolean;
	readonly parent: Injector | undefined;
	readonly providers: WeakMapLike<Injectable<unknown>, Provider<unknown>>;
}

export function createInjector(
	parentInjector: Injector | undefined,
	allowMissingProvider: boolean
): Injector {
	return {
		allowMissingProvider: allowMissingProvider,
		parent: allowMissingProvider ? undefined : parentInjector,
		providers: typeof WeakMap === "function" ? new WeakMap() : createWeakMapPolyfill()
	};
}

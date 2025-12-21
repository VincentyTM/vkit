import { Provider } from "./createProvider.js";
import { createWeakMapPolyfill, WeakMapLike } from "./createWeakMapPolyfill.js";

export interface Injector {
	readonly allowMissingProvider: boolean;
	readonly providers: WeakMapLike<object, Provider<unknown>>;
}

export function createInjector(allowMissingProvider: boolean): Injector {
	return {
		allowMissingProvider: allowMissingProvider,
		providers: typeof WeakMap === "function" ? new WeakMap() : createWeakMapPolyfill()
	};
}

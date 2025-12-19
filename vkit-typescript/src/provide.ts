import { getEffect, setReactiveNode } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { Injectable } from "./createInjectable.js";
import { createInjector } from "./createInjector.js";
import { createProvider } from "./createProvider.js";
import { noop } from "./noop.js";

/**
 * Creates a scope in which the specified services can be instantiated with the same instance.
 * @example
 * const AuthService = createInjectable(() => ({
 * 	isLoggedIn: false
 * }));
 * 
 * const LanguageService = createInjectable(() => ({
 * 	language: "en"
 * }));
 * 
 * function MyComponent() {
 * 	return provide([AuthService, LanguageService], () => {
 * 		return [
 * 			P("Print the same language twice"),
 * 			Language(),
 * 			Language()
 * 		];
 * 	});
 * }
 * 
 * function Language() {
 * 	const languageService = inject(LanguageService);
 * 	
 * 	return P("Provided language: ", languageService.language);
 * }
 * @param configs An array of injectable services.
 * @param getContent A callback function with no parameters.
 * The provided services can be used within the scope of this function.
 * @returns The result returned by `getContent`.
 */
export function provide<R>(
	configs: Injectable<unknown>[] | null,
	getContent: () => R
): R {
	var parentEffect = getEffect();
	var injector = createInjector(parentEffect.injector, configs === null);
	var effect = createEffect(parentEffect, noop, undefined, injector);

	injector.effect = effect;

	if (configs !== null) {
		var n = configs.length;

		for (var i = 0; i < n; ++i) {
			var config = configs[i];
			var provider = createProvider(config, effect);
			injector.providers.set(config, provider);
		}
	}

	try {
		setReactiveNode(effect);
		return getContent();
	} finally {
		setReactiveNode(parentEffect);
	}
}

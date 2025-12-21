import { getEffect, setReactiveNode } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { Injectable } from "./createInjectable.js";
import { createInjector } from "./createInjector.js";
import { createProvider } from "./createProvider.js";
import { noop } from "./noop.js";

/**
 * Creates a scope in which the specified services can be instantiated with the same instance.
 * @example
 * const LanguageService = createInjectable(() => signal("en"));
 * 
 * const ThemeService = createInjectable(() => signal("light"));
 * 
 * function MyComponent() {
 * 	return provide([
 * 		LanguageService,
 * 		ThemeService.override(() => signal("dark"))
 * 	], () => {
 * 		return [
 * 			P("Display the same values twice:"),
 * 			Display(),
 * 			Display()
 * 		];
 * 	});
 * }
 * 
 * function Display() {
 * 	const language = inject(LanguageService);
 * 	const theme = inject(ThemeService);
 * 	
 * 	return [
 * 		P("Provided language: ", language),
 * 		P("Provided theme: ", theme)
 * 	];
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
	var injector = createInjector(configs === null);
	var effect = createEffect(parentEffect, noop, undefined, injector);

	if (configs !== null) {
		var n = configs.length;

		for (var i = 0; i < n; ++i) {
			var config = configs[i];
			var provider = createProvider(config, effect);
			injector.providers.set(config.token, provider);
		}
	}

	try {
		setReactiveNode(effect);
		return getContent();
	} finally {
		setReactiveNode(parentEffect);
	}
}

import { getEffect, setReactiveNode } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { Injectable } from "./createInjectable.js";
import { createProvider } from "./createProvider.js";

/**
 * This method can be used to inject a service instance instead of passing it as a parameter.
 * 
 * It traverses the injector tree upwards to find the nearest provider of a service.
 * If none can be found, a service provider is created in the root injector instead.
 * The method then creates a service instance for the service provider if no instance exists in the provider yet and returns it.
 * If it does exist, the method returns the existing instance.
 * @example
 * const MyService = createInjectable(() => {
 * 	return {name: "world"};
 * });
 * 
 * function MyComponent() {
 * 	const myService1 = inject(MyService);
 * 	const myService2 = inject(MyService);
 * 	
 * 	// myService1 === myService2
 * 	
 * 	return H1("Hello ", myService1.name);
 * }
 * @param injectable Used as a key to find a provider of the service.
 * @returns An instance of the injectable service.
 */
export function inject<T>(injectable: Injectable<T>): T {
	var parentEffect = getEffect();
	var effect: Effect | undefined = parentEffect;

	while (effect !== undefined) {
		var injector = effect.injector;

		if (injector === undefined) {
			effect = effect.injectorParent;
			continue;
		}

		var provider = injector.providers.get(injectable);

		if (provider !== undefined) {
			if (provider.isCreated) {
				return provider.instance as T;
			}
		
			try {
				setReactiveNode(provider.effect);
		
				var instance = provider.injectable.create() as T;
				provider.isCreated = true;
				provider.instance = instance;
				return instance;
			} finally {
				setReactiveNode(parentEffect);
			}
		}

		if (injector.allowMissingProvider) {
			var newProvider = createProvider(injectable, effect);
			injector.providers.set(injectable, newProvider);

			try {
				setReactiveNode(newProvider.effect);

				var instance = injectable.create();
				newProvider.isCreated = true;
				newProvider.instance = instance;
				return instance;
			} finally {
				setReactiveNode(parentEffect);
			}
		}

		effect = effect.injectorParent;
	}

	throw new Error("No injector contains a provider for this injectable");
}

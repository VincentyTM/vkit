import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { createProvider } from "./createProvider.js";
import { Config } from "./provide.js";

function mount(): void {
	throw new Error("The root effect cannot be updated");
}

export function getValueFromClass(config: Config): unknown {
	if ("create" in config) {
		return config.create();
	}
	return new (config as any)();
}

export var rootInjector = createInjector(undefined, function(token) {
	var provider = createProvider(getValueFromClass, token, rootEffect);
	rootInjector.container.set(token, provider);
	return provider.getInstance();
});

export var rootEffect = createEffect(undefined, rootInjector, mount);

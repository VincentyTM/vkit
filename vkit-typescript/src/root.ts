import { createComponent } from "./createComponent.js";
import { createInjector } from "./createInjector.js";
import { createProvider } from "./createProvider.js";
import { Config } from "./provide.js";

function mount(): void {
	throw new Error("The root component cannot be rerendered");
}

export function getValueFromClass(config: Config): unknown {
	if ("create" in config) {
		return config.create();
	}
	return new (config as any)();
}

export var rootInjector = createInjector(null, function(token) {
	var provider = createProvider(getValueFromClass, token, rootComponent);
	rootInjector.container.set(token, provider);
	return provider.getInstance();
});

export var rootComponent = createComponent(mount, null, rootInjector);

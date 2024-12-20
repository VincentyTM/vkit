import createComponent from "./createComponent.js";
import createInjector from "./createInjector.js";
import createProvider from "./createProvider.js";
import type {Config, ConfigClass} from "./provide.js";

function mount(): void {
	throw new Error("The root component cannot be rerendered");
}

export function getValueFromClass(config: Config): InstanceType<ConfigClass> {
	return new (config as ConfigClass)();
}

var rootInjector = createInjector(null, function(token): InstanceType<ConfigClass> {
	var provider = createProvider(getValueFromClass, token, rootComponent);
	rootInjector.container.set(token, provider);
	return provider.getInstance();
});

var rootComponent = createComponent(mount, null, rootInjector);

export {rootComponent, rootInjector};

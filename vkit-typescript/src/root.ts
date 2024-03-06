import component from "./component";
import {Config, ConfigClass} from "./provide";
import createInjector from "./injector";
import createProvider from "./provider";

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

var rootComponent = component(mount, null, rootInjector);

export {rootComponent, rootInjector};

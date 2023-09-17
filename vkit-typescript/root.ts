import component from "./component";
import {Config, ConfigClass} from "./provide";
import createInjector from "./injector";
import createProvider from "./provider";

function mount() {
	throw new Error("The root component cannot be rerendered");
}

function getValueFromClass(config: Config) {
	return new (config as ConfigClass)();
}

var rootInjector = createInjector(null, function(token) {
	var provider = createProvider(getValueFromClass, token, rootComponent);
	rootInjector.container.set(token, provider);
	return provider.getInstance();
});

var rootComponent = component(mount, null, rootInjector);

export {rootComponent, rootInjector};

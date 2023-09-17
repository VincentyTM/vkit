import createInjector, {TokenLike} from "./injector";
import createProvider, {Provider} from "./provider";
import {getComponent, getInjector, setInjector} from "./contextGuard";
import inject from "./inject";
import {View} from "./view";

export type ConfigClass = new () => unknown;
export type ConfigProvide = {provide: TokenLike & (new () => unknown)};
export type ConfigUseClass = {provide: TokenLike, useClass: new () => unknown};
export type ConfigUseExisting = {provide: TokenLike, useExisting: TokenLike};
export type ConfigUseFactory = {provide: TokenLike, useFactory: () => unknown};
export type ConfigUseValue = {provide: TokenLike, useValue: unknown};

type ConfigProvidable = (
	ConfigProvide |
	ConfigUseClass |
	ConfigUseExisting |
	ConfigUseFactory |
	ConfigUseValue
);

export type Config = ConfigClass | ConfigProvidable;

function getValueFromClass(config: Config) {
	return new (config as ConfigClass)();
}

function getValueFromProvide(config: Config) {
	return new (config as ConfigProvide).provide();
}

function getValueFromUseClass(config: Config) {
	return new (config as ConfigUseClass).useClass();
}

function getValueFromUseExisting(config: Config) {
	return inject((config as ConfigUseExisting).useExisting);
}

function getValueFromUseFactory(config: Config) {
	return (config as ConfigUseFactory).useFactory();
}

function getValueFromUseValue(config: Config) {
	return (config as ConfigUseValue).useValue;
}

export default function provide(configs: Config[] | null, getView: () => View) {
	var component = getComponent();
	var prevInjector = getInjector(true);
	var parentInjector = configs ? prevInjector : null;
	var injector = createInjector(parentInjector, configs ? null : function(token) {
		var provider = createProvider(getValueFromClass, token, component);
		injector.container.set(token, provider);
		return provider.getInstance();
	});

	if (configs) {
		var n = configs.length;

		for (var i = 0; i < n; ++i) {
			var config = configs[i];
			var provider: Provider<unknown>;

			if ((config as ConfigProvidable).provide) {
				if ((config as ConfigUseFactory).useFactory) {
					provider = createProvider(getValueFromUseFactory, config, component);
				} else if ("useValue" in (config as ConfigUseValue)) {
					provider = createProvider(getValueFromUseValue, config, component);
				} else if ((config as ConfigUseClass).useClass) {
					provider = createProvider(getValueFromUseClass, config, component);
				} else if ((config as ConfigUseExisting).useExisting) {
					provider = createProvider(getValueFromUseExisting, config, component);
				} else {
					provider = createProvider(getValueFromProvide, config, component);
				}
				injector.container.set((config as ConfigProvidable).provide, provider);
			} else {
				provider = createProvider(getValueFromClass, config, component);
				injector.container.set(config as ConfigClass, provider);
			}
		}
	}

	try {
		setInjector(injector);
		return getView();
	} finally {
		setInjector(prevInjector);
	}
}

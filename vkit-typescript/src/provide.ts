import { createInjector, TokenLike } from "./createInjector.js";
import { createProvider, Provider } from "./createProvider.js";
import { getComponent, getInjector, setInjector } from "./contextGuard.js";
import { inject } from "./inject.js";

export type ConfigClass = (new () => unknown) | {create: () => unknown};
export type ConfigProvide = {provide: TokenLike & (new () => unknown)};
export type ConfigUseClass = {provide: TokenLike, useClass: new () => unknown};
export type ConfigUseExisting = {provide: TokenLike, useExisting: TokenLike};
export type ConfigUseFactory = {provide: TokenLike, useFactory: () => unknown};
export type ConfigUseValue = {provide: TokenLike, useValue: unknown};

type ConfigProvidable = (
	| ConfigProvide
	| ConfigUseClass
	| ConfigUseExisting
	| ConfigUseFactory
	| ConfigUseValue
);

export type Config = ConfigClass | ConfigProvidable;

function getValueFromClass(config: Config): unknown {
	if ("create" in config) {
		return config.create();
	}
	return new (config as any)();
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

/**
 * Creates providers for the specified services which are available in the component subtree generated by a callback.
 * @example
 * class AuthService {
 * 	isLoggedIn = false;
 * }
 * 
 * class LanguageService {
 * 	language = "en";
 * }
 * 
 * function MyComponent() {
 * 	return provide([AuthService, LanguageService], () => {
 * 		return Language();
 * 	});
 * }
 * 
 * function Language() {
 * 	const languageService = inject(LanguageService);
 * 	
 * 	return ["Provided language: ", languageService.language];
 * }
 * @param configs An array of provider configurations.
 * A configuration can be a service class (and token) itself or an object with one of these signatures:
 * * `{provide: Token, useClass: ServiceClass}`
 * * `{provide: Token, useExisting: ServiceToken}`
 * * `{provide: Token, useFactory: ServiceFactory}`
 * * `{provide: Token, useValue: ServiceValue}`
 * @param getView A callback function with no parameters which returns a view.
 * The provided services can be used within the component subtree generated by this function.
 * @returns The view returned by `getView`.
 */
export function provide<R>(
	configs: Config[] | null,
	getView: () => R
): R {
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
				injector.container.set(config as never, provider);
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

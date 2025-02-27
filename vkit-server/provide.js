import {getInjector, setInjector} from "./contextGuard.js";
import createInjector from "./createInjector.js";
import createProvider from "./createProvider.js";
import inject from "./inject.js";

function getValueFromClass(config) {
	if ("create" in config) {
		return config.create();
	}
	return new config();
}

function getValueFromProvide(config) {
	return new config.provide();
}

function getValueFromUseClass(config) {
	return new config.useClass();
}

function getValueFromUseExisting(config) {
	return inject(config.useExisting);
}

function getValueFromUseFactory(config) {
	return config.useFactory();
}

function getValueFromUseValue(config) {
	return config.useValue;
}

export default function provide(configs, getView) {
	var prevInjector = getInjector(true);
	var parentInjector = configs ? prevInjector : null;
	
	var injector = createInjector(parentInjector, configs ? null : function(token) {
		var provider = createProvider(getValueFromClass, token);
		injector.container.set(token, provider);
		return provider.getInstance();
	});
	
	if (configs) {
		var n = configs.length;

		for (var i = 0; i < n; ++i) {
			var config = configs[i];
			var provider;

			if (config.provide) {
				if (config.useFactory) {
					provider = createProvider(getValueFromUseFactory, config);
				} else if ("useValue" in config) {
					provider = createProvider(getValueFromUseValue, config);
				} else if (config.useClass) {
					provider = createProvider(getValueFromUseClass, config);
				} else if (config.useExisting) {
					provider = createProvider(getValueFromUseExisting, config);
				} else {
					provider = createProvider(getValueFromProvide, config);
				}
				injector.container.set(config.provide, provider);
			} else {
				provider = createProvider(getValueFromClass, config);
				injector.container.set(config, provider);
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

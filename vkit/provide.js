(function($) {

var createInjector = $.createInjector;
var createProvider = $.createProvider;
var getComponent = $.getComponent;
var getInjector = $.getInjector;
var inject = $.inject;
var setInjector = $.setInjector;

function getValueFromClass(config) {
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

function provide(configs, getView) {
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
			var provider;

			if (config.provide) {
				if (config.useFactory) {
					provider = createProvider(getValueFromUseFactory, config, component);
				} else if ("useValue" in config) {
					provider = createProvider(getValueFromUseValue, config, component);
				} else if (config.useClass) {
					provider = createProvider(getValueFromUseClass, config, component);
				} else if (config.useExisting) {
					provider = createProvider(getValueFromUseExisting, config, component);
				} else {
					provider = createProvider(getValueFromProvide, config, component);
				}

				injector.container.set(config.provide, provider);
			} else {
				provider = createProvider(getValueFromClass, config, component);
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

$.provide = provide;

})($);

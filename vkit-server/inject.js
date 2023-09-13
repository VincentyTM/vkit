var contextGuard = require("./contextGuard");
var getInjector = contextGuard.getInjector;

function inject(token, injector) {
	if (!injector) {
		injector = getInjector();
	}
	
	var provider;
	
	while (!(provider = injector.container.get(token))) {
		var handleMissingProvider = injector.handleMissingProvider;
		var parent = injector.parent;
		
		if (!parent) {
			if (typeof handleMissingProvider === "function") {
				return handleMissingProvider(token);
			}
			throw new Error("There is no provider for this token");
		}
		
		injector = parent;
	}
	
	return provider.getInstance();
}

module.exports = inject;

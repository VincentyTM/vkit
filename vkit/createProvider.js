(function($) {

var getComponent = $.getComponent;
var setComponent = $.setComponent;

function createProvider(createInstance, config, component) {
	var instance;
	var instanceCreated = false;
	
	function getInstance() {
		if (instanceCreated) {
			return instance;
		}
		
		var previousComponent = getComponent();
		
		try {
			setComponent(component);
			instance = createInstance(config);
		} finally {
			setComponent(previousComponent);
		}
		
		instanceCreated = true;
		return instance;
	}
	
	return {
		getInstance: getInstance
	};
}

$.createProvider = createProvider;

})($);

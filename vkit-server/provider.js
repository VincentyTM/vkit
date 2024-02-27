export default function createProvider(createInstance, config) {
	var instance;
	var instanceCreated = false;
	
	function getInstance() {
		if (instanceCreated) {
			return instance;
		}
		
		instance = createInstance(config);
		instanceCreated = true;
		return instance;
	}
	
	return {
		getInstance: getInstance
	};
}

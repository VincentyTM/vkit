var supportsWeakMap = typeof WeakMap === "function";
var currentProvider = null;

function serviceFactory(service){
	return new service();
}

function configFactory(config){
	if( "useValue" in config ){
		return config.useValue;
	}
	if( "useFactory" in config ){
		return config.useFactory.apply(null, config.params || []);
	}
	if( "useClass" in config ){
		return new config.useClass();
	}
	if( "useExisting" in config ){
		return inject(config.useExisting);
	}
	return new config.provide();
}

function Container(service, serviceOrConfig){
	this.service = service;
	this.serviceOrConfig = serviceOrConfig;
	this.instance = null;
	this.instanceCreated = false;
	this.createInstance = service === serviceOrConfig ? serviceFactory : configFactory;
}

Container.prototype.getInstance = function(){
	if( this.instanceCreated ){
		return this.instance;
	}
	this.instance = this.createInstance(this.serviceOrConfig);
	this.instanceCreated = true;
	return this.instance;
};

function Provider(parent){
	this.parent = parent;
	this.containers = supportsWeakMap ? new WeakMap() : [];
}

Provider.prototype.getContainer = function(service){
	var containers = this.containers;
	if( containers.get ){
		return containers.get(service);
	}
	for(var i=containers.length; i--;){
		if( containers[i].service === service ){
			return containers[i];
		}
	}
};

Provider.prototype.registerService = function(service){
	var key = typeof service === "object" ? service.provide : service;
	var containers = this.containers;
	if( supportsWeakMap ){
		containers.set(key, new Container(key, service));
	}else{
		containers.push(new Container(key, service));
	}
};

function inject(service){
	var provider = currentProvider;
	var container = null;
	while(!(container = provider.getContainer(service)) && provider.parent){
		provider = provider.parent;
	}
	if(!container){
		container = new Container(service, service);
		var containers = provider.containers;
		containers.set ? containers.set(service, container) : containers.push(container);
	}
	return container.getInstance();
}

function provide(services, getView){
	var prevProvider = currentProvider;
	var provider = new Provider(services ? prevProvider : null);
	if( services ){
		var n = services.length;
		for(var i=0; i<n; ++i){
			provider.registerService(services[i]);
		}
	}
	try{
		currentProvider = provider;
		return getView();
	}finally{
		currentProvider = prevProvider;
	}
}

module.exports = {
	inject: inject,
	provide: provide
};

(function($){

var rootComponent = $.rootComponent;
var getComponent = $.getComponent;
var setComponent = $.setComponent;
var getProvider = $.getProvider;
var setProvider = $.setProvider;
var supportsWeakMap = typeof WeakMap === "function";

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

Container.prototype.getInstance = function(component){
	if( this.instanceCreated ){
		return this.instance;
	}
	var prevComponent = getComponent();
	try{
		setComponent(component);
		this.instance = this.createInstance(this.serviceOrConfig);
	}finally{
		setComponent(prevComponent);
	}
	this.instanceCreated = true;
	return this.instance;
};

function Provider(parent, component){
	this.parent = parent;
	this.containers = supportsWeakMap ? new WeakMap() : [];
	this.component = component;
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
	var provider = getProvider();
	var container = null;
	while(!(container = provider.getContainer(service)) && provider.parent){
		provider = provider.parent;
	}
	if(!container){
		container = new Container(service, service);
		var containers = provider.containers;
		containers.set ? containers.set(service, container) : containers.push(container);
	}
	return container.getInstance(provider.component);
}

function provide(services, getView){
	var component = getComponent();
	var prevProvider = getProvider();
	var provider = new Provider(services ? prevProvider : null, component);
	if( services ){
		var n = services.length;
		for(var i=0; i<n; ++i){
			provider.registerService(services[i]);
		}
	}
	try{
		setProvider(provider);
		return getView();
	}finally{
		setProvider(prevProvider);
	}
}

setProvider(new Provider(null, rootComponent));

$.inject = inject;
$.provide = provide;

})($);

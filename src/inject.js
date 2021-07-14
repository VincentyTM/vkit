(function($){

var supportsWeakMap = typeof WeakMap=="function";

function Provider(service){
	this.service = service;
	this.instance = null;
}

Provider.prototype.getInstance = function(){
	if( this.instance )
		return this.instance;
	return this.instance = new this.service();
};

function Injector(parent, providers){
	this.parent = parent;
	this.providers = providers;
}

Injector.stack = [new Injector(null, supportsWeakMap ? new WeakMap() : [])];

Injector.prototype.getProvider = function(service){
	var providers = this.providers;
	if( providers.get )
		return providers.get(service);
	for(var i=providers.length; i--;){
		if( providers[i].service===service )
			return providers[i];
	}
};

$.inject = function(service){
	var injector = Injector.stack[Injector.stack.length - 1];
	var provider = null;
	while( injector && !(provider = injector.getProvider(service)))
		injector = injector.parent;
	if(!injector){
		injector = Injector.stack[0];
		provider = new Provider(service);
		var providers = injector.providers;
		providers.set ? providers.set(service, provider) : providers.push(provider);
	}
	Injector.stack.push(injector);
	var ret = provider.getInstance();
	Injector.stack.pop();
	return ret;
};

$.injector = function(services, func){
	if( supportsWeakMap ){
		var providers = new WeakMap();
		services.forEach(function(service){
			providers.set(service, new Provider(service));
		});
	}else{
		var providers = new Array(services.length);
		for(var i=services.length; i--;)
			providers[i] = new Provider(services[i]);
	}
	var injector = new Injector(Injector.stack[Injector.stack.length - 1], providers);
	Injector.stack.push(injector);
	var ret = func();
	Injector.stack.pop();
	return ret;
};

})($);

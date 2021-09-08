(function($){

var supportsWeakMap = typeof WeakMap=="function";

function Container(service){
	this.service = service;
	this.instance = null;
}

Container.prototype.getInstance = function(){
	return this.instance || (this.instance = new this.service());
};

function Provider(parent, containers){
	this.parent = parent;
	this.containers = containers;
}

var rootProvider = new Provider(null, supportsWeakMap ? new WeakMap() : []);
var currentProvider = rootProvider;

Provider.prototype.getContainer = function(service){
	var containers = this.containers;
	if( containers.get )
		return containers.get(service);
	for(var i=containers.length; i--;){
		if( containers[i].service===service )
			return containers[i];
	}
};

$.inject = function(service){
	var provider = currentProvider;
	var container = null;
	while( provider && !(container = provider.getContainer(service)))
		provider = provider.parent;
	if(!provider){
		provider = rootProvider;
		container = new Container(service);
		var containers = provider.containers;
		containers.set ? containers.set(service, container) : containers.push(container);
	}
	var previousProvider = currentProvider;
	currentProvider = provider;
	try{
		return container.getInstance();
	}finally{
		currentProvider = previousProvider;
	}
};

$.provide = function(services, getContent){
	if( supportsWeakMap ){
		var containers = new WeakMap();
		services.forEach(function(service){
			containers.set(service, new Container(service));
		});
	}else{
		var containers = new Array(services.length);
		for(var i=services.length; i--;)
			containers[i] = new Container(services[i]);
	}
	$. unmount(function(){
		if( supportsWeakMap ){
			services.forEach(function(service){
				var container = containers.get(service);
				if( container.instance && container.instance.destructor ){
					container.instance.destructor();
				}
			});
		}else{
			for(var i=containers.length; i--;){
				var container = containers[i];
				if( container.instance && container.instance.destructor ){
					container.instance.destructor();
				}
			}
		}
	});
	try{
		var previousProvider = currentProvider;
		currentProvider = new Provider(currentProvider, containers);
		return getContent();
	}finally{
		currentProvider = previousProvider;
	}
};

$.getProvider = function(){
	return currentProvider;
};

$.setProvider = function(provider){
	currentProvider = provider;
};

})($);

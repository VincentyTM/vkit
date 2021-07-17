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

var stack = [new Provider(null, supportsWeakMap ? new WeakMap() : [])];

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
	var provider = stack[stack.length - 1];
	var container = null;
	while( provider && !(container = provider.getContainer(service)))
		provider = provider.parent;
	if(!provider){
		provider = stack[0];
		container = new Container(service);
		var containers = provider.containers;
		containers.set ? containers.set(service, container) : containers.push(container);
	}
	stack.push(provider);
	var instance = container.getInstance();
	stack.pop();
	return instance;
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
	var provider = new Provider(stack[stack.length - 1], containers);
	stack.push(provider);
	var content = getContent();
	stack.pop();
	return content;
};

})($);

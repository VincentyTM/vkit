(function($, document){

var group = $.group;
var toArray = $.fn.toArray;
var createComponentCore = $.createComponent;
var anySubscribed = false;

function createComponent(parent, stopRender){
	var component = createComponentCore(parent, stopRender);
	var unsubscribe = component.onRender.subscribe(function(){
		anySubscribed = true;
		unsubscribe();
	});
	return component;
}

function noop(){}

var rootComponent = createComponent(null);
var currentComponent = rootComponent;

function unmount(func){
	return currentComponent !== rootComponent ? currentComponent.onDestroy.subscribe(func) : noop;
}

function withComponent(func, component){
	var provider = currentProvider;
	if(!component) component = currentComponent;
	return function(){
		var prevProvider = currentProvider;
		var prevComponent = currentComponent;
		try{
			currentProvider = provider;
			currentComponent = component;
			return func.apply(this, arguments);
		}catch(ex){
			component.throwError(ex);
		}finally{
			currentProvider = prevProvider;
			currentComponent = prevComponent;
		}
	};
}

function getCurrentComponent(){
	return currentComponent;
}

function renderComponents(){
	if( anySubscribed ){
		rootComponent.render();
	}
}

function getViewOf(getData, getView, immutable, onRender){
	var A = onRender ? getData : getData();
	var prev = currentComponent;
	var component = currentComponent = createComponent(prev, immutable);
	try{
		var view = getView ? getView(A) : A;
		prev.children.push(component);
		(onRender || component).subscribe(withComponent(function(newData){
			var B = onRender ? newData : getData();
			if( A === B ){
				return;
			}
			component.unmount();
			component.children.splice(0, component.children.length);
			component.replaceView(getView ? getView(B) : B);
			A = B;
		}, component));
		return group(component.start, view, component.end);
	}finally{
		currentComponent = prev;
	}
}

function mapViewsOf(array, getView, immutable, onRender){
	var oldArray = typeof array === "function" ? array() : array;
	var items = toArray.call(oldArray);
	var prev = currentComponent;
	var container = createComponent(prev, immutable);
	prev.children.push(container);
	var n = items.length;
	var views = new Array(n);
	
	for(var i=0; i<n; ++i){
		try{
			var component = currentComponent = createComponent(container);
			component.index = i;
			views[i] = [component.start, getView(items[i]), component.end];
			container.children.push(component);
		}finally{
			currentComponent = prev;
		}
	}
	
	function insertItem(index, data){
		items.splice(index, 0, data);
		var prev = currentComponent;
		try{
			var component = currentComponent = createComponent(container);
			var view = getView(data);
			var anchor = container.getChildStart(index);
			component.insertView(view, anchor);
			container.children.splice(index, 0, component);
		}finally{
			currentComponent = prev;
		}
	}
	
	(onRender || container).subscribe(withComponent(function(newArray){
		if(!newArray) newArray = typeof array === "function" ? array() : array;
		if( immutable && newArray === oldArray ){
			return;
		}
		var i, n=items.length, m=newArray.length;
		for(i=0; i<n; ++i){
			if( i<m ){
				var data = items[i];
				if( data === newArray[i] ){
					continue;
				}
				if( i+1<m ){
					if( data === newArray[i+1] ){
						insertItem(i, newArray[i]);
						++n; ++i;
						continue;
					}
					if( i+2<m ){
						if( data === newArray[i+2] ){
							insertItem(i, newArray[i+1]);
							insertItem(i, newArray[i]);
							n+=2; i+=2;
							continue;
						}
						if( i+3<m && data === newArray[i+3] ){
							insertItem(i, newArray[i+2]);
							insertItem(i, newArray[i+1]);
							insertItem(i, newArray[i]);
							n+=3; i+=3;
							continue;
						}
					}
				}
			}
			items.splice(i, 1);
			container.removeChild(i);
			--n; --i;
		}
		for(; i<m; ++i){
			insertItem(i, newArray[i]);
		}
		for(i=0; i<m; ++i){
			container.children[i].index = i;
		}
	}));
	
	return group(container.start, views, container.end);
}

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
	this.instance = withComponent(this.createInstance, component)(this.serviceOrConfig);
	this.instanceCreated = true;
	return this.instance;
};

function Provider(parent, containers, component){
	this.parent = parent;
	this.containers = containers;
	this.component = component;
}

var rootProvider = new Provider(null, supportsWeakMap ? new WeakMap() : [], currentComponent);
var currentProvider = rootProvider;

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

function inject(service){
	var provider = currentProvider;
	var container = null;
	while( provider && !(container = provider.getContainer(service))){
		provider = provider.parent;
	}
	if(!container){
		provider = rootProvider;
		container = new Container(service, service);
		var containers = provider.containers;
		containers.set ? containers.set(service, container) : containers.push(container);
	}
	return container.getInstance(provider.component);
}

function provide(services, getContent){
	if( supportsWeakMap ){
		var containers = new WeakMap();
		services.forEach(function(service){
			var key = typeof service === "object" ? service.provide : service;
			containers.set(key, new Container(key, service));
		});
	}else{
		var containers = new Array(services.length);
		for(var i=services.length; i--;){
			var service = services[i];
			containers[i] = new Container(typeof service === "object" ? service.provide : service, service);
		}
	}
	try{
		var previousProvider = currentProvider;
		currentProvider = new Provider(currentProvider, containers, currentComponent);
		return group(getContent());
	}finally{
		currentProvider = previousProvider;
	}
}

$.withComponent = withComponent;
$.component = getCurrentComponent;
$.component.render = renderComponents;
$.unmount = unmount;
$.is = getViewOf;
$.map = mapViewsOf;
$.inject = inject;
$.provide = provide;

})($, document);

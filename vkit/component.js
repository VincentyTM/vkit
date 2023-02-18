(function($, document){

var toArray = $.fn.toArray;
var createComponent = $.component;

function noop(){}

var rootComponent = createComponent(null);
var currentComponent = rootComponent;

function contextGuard(){
	if(!currentComponent){
		throw new Error("This function can only be called synchronously from a component");
	}
}

function unmount(callback){
	contextGuard();
	return currentComponent !== rootComponent ? currentComponent.onDestroy.subscribe(callback) : noop;
}

function withContext(getView){
	contextGuard();
	var provider = currentProvider;
	var component = currentComponent;
	return function(){
		var prevProvider = currentProvider;
		var prevComponent = currentComponent;
		try{
			currentProvider = provider;
			currentComponent = component;
			return getView.apply(this, arguments);
		}catch(ex){
			component.throwError(ex);
		}finally{
			currentProvider = prevProvider;
			currentComponent = prevComponent;
		}
	};
}

function getCurrentComponent(allowNull){
	if(!allowNull){
		contextGuard();
	}
	return currentComponent;
}

function setCurrentComponent(component){
	currentComponent = component;
}

function renderComponents(){
	rootComponent.render();
}

function getViewOf(getData, getView, immutable, onRender){
	contextGuard();
	var A = onRender ? getData : getData();
	var prev = currentComponent;
	var component = currentComponent = createComponent(prev, immutable);
	try{
		var view = getView ? getView(A) : A;
		prev.children.push(component);
		(onRender || component).subscribe(withContext(function(newData){
			var B = onRender ? newData : getData();
			if( A === B ){
				return;
			}
			component.clearView();
			component.unmount();
			component.children.splice(0, component.children.length);
			component.appendView(getView ? getView(B) : B);
			A = B;
		}, component));
		return [component.start, view, component.end];
	}finally{
		currentComponent = prev;
	}
}

function getViewsOf(array, getView, immutable, onRender){
	contextGuard();
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
	
	(onRender || container).subscribe(withContext(function(newArray){
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
	
	return [container.start, views, container.end];
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
	this.instance = withContext(this.createInstance, component)(this.serviceOrConfig);
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
	contextGuard();
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
	return container.getInstance(provider.component);
}

function provide(services, getContent){
	contextGuard();
	var containers;
	if( services ){
		if( supportsWeakMap ){
			containers = new WeakMap();
			services.forEach(function(service){
				var key = typeof service === "object" ? service.provide : service;
				containers.set(key, new Container(key, service));
			});
		}else{
			containers = new Array(services.length);
			for(var i=services.length; i--;){
				var service = services[i];
				containers[i] = new Container(typeof service === "object" ? service.provide : service, service);
			}
		}
	}else{
		containers = supportsWeakMap ? new WeakMap() : [];
	}
	try{
		var previousProvider = currentProvider;
		currentProvider = new Provider(services ? currentProvider : null, containers, currentComponent);
		return getContent();
	}finally{
		currentProvider = previousProvider;
	}
}

$.withContext = withContext;
$.currentComponent = getCurrentComponent;
$.setCurrentComponent = setCurrentComponent;
$.renderComponents = renderComponents;
$.unmount = unmount;
$.view = getViewOf;
$.views = getViewsOf;
$.inject = inject;
$.provide = provide;

})($, document);

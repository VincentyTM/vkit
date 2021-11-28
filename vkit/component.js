(function($, document){

var anySubscribed = false;

function noop(){}

function insertBefore(view, anchor){
	var parent = anchor.parentNode;
	var n = view.length;
	if( document.createDocumentFragment ){
		var container = document.createDocumentFragment();
		for(var i=0; i<n; ++i){
			container.appendChild(view[i]);
		}
		parent.insertBefore(container, anchor);
	}else{
		for(var i=0; i<n; ++i){
			parent.insertBefore(view[i], anchor);
		}
	}
}

function createComponent(parent, stopRender){
	var children = [];
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	return {
		index: 0,
		children: children,
		onRender: $.observable(),
		onDestroy: $.observable(),
		start: start,
		end: end,
		subscribe: function(update){
			anySubscribed = true;
			this.onRender.subscribe(update);
		},
		unmount: function(){
			for(var i=children.length; i--;){
				children[i].unmount();
			}
			this.onDestroy();
			this.onDestroy = $.observable();
		},
		render: function(){
			this.onRender();
			if( stopRender ){
				return;
			}
			var n = children.length;
			for(var i=0; i<n; ++i){
				children[i].render();
			}
		},
		removeChild: function(index){
			var removed = children.splice(index, 1)[0];
			if( removed ){
				removed.unmount();
				removed.removeView();
			}
		},
		removeView: function(){
			this.clearView();
			if( start.parentNode ) start.parentNode.removeChild(start);
			if( end.parentNode ) end.parentNode.removeChild(end);
		},
		clearView: function(){
			var parent = start.parentNode;
			if(!parent) return;
			for(var el=start.nextSibling; el && el !== end; el = start.nextSibling){
				parent.removeChild(el);
			}
		},
		insertView: function(view, anchor){
			insertBefore($.group(start, view, end), anchor);
		},
		replaceView: function(view){
			this.clearView();
			insertBefore(view, end);
		},
		getChildStart: function(index){
			var child = children[index];
			return child ? child.start : end;
		}
	};
}

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
		}finally{
			currentProvider = prevProvider;
			currentComponent = prevComponent;
		}
	};
}

$.component = function(){
	return currentComponent;
};

$.component.render = function(){
	if( anySubscribed ){
		rootComponent.render();
	}
};

$.unmount = unmount;

$.withComponent = withComponent;

$.is = function(getData, getView, immutable, onRender){
	var A = onRender ? getData : getData();
	var prev = currentComponent;
	var component = currentComponent = createComponent(prev, immutable);
	try{
		var view = getView ? getView(A) : A;
		prev.children.push(component);
		(onRender || component).subscribe($.withComponent(function(newData){
			var B = onRender ? newData : getData();
			if( A === B ){
				return;
			}
			component.unmount();
			component.children.splice(0, component.children.length);
			component.replaceView($.group(getView ? getView(B) : B));
			A = B;
		}, component));
		return $.group(component.start, view, component.end);
	}finally{
		currentComponent = prev;
	}
};

$.map = function(array, getView, immutable, onRender){
	var oldArray = typeof array === "function" ? array() : array;
	var items = $.fn.toArray.call(oldArray);
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
	
	(onRender || container).subscribe($.withComponent(function(newArray){
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
	
	return $.group(container.start, views, container.end);
};

$.effect = function(setter){
	setter();
	currentComponent.subscribe(setter);
};

$.css = function(prop, getter){
	return function(element){
		var style = element.style;
		var oldValue = style[prop] = getter(element);
		currentComponent.subscribe(function(){
			var value = getter(element);
			if( oldValue!==value ){
				oldValue = style[prop] = value;
			}
		});
	};
};

$.prop = function(prop, getter){
	return function(element){
		var oldValue = element[prop] = getter(element);
		currentComponent.subscribe(function(){
			var value = getter(element);
			if( oldValue!==value ){
				oldValue = element[prop] = value;
			}
		});
	};
};

$.text = function(getter){
	var oldValue = String(getter());
	var node = document.createTextNode(oldValue);
	currentComponent.subscribe(function(){
		var value = String(getter());
		if( oldValue!==value ){
			oldValue = node.nodeValue = value;
		}
	});
	return node;
};

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
		return getContent();
	}finally{
		currentProvider = previousProvider;
	}
}

$.inject = inject;
$.provide = provide;

})($, document);

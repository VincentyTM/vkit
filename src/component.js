(function($){

var mounts = [];

$.observable = function(){
	var subscriptions = {};
	var id = 0;
	function render(){
		for(var id in subscriptions)
			subscriptions[id].apply(null, arguments);
	}
	render.subscribe = function(fn){
		var cid = ++id;
		subscriptions[cid] = fn;
		return function(){
			delete subscriptions[cid];
		};
	};
	return render;
};

$.withComponent = function(func){
	var component = Component.current();
	var provider = providers[providers.length - 1];
	return function(){
		Component.stack.push(component);
		providers.push(provider);
		var ret = func.apply(this, arguments);
		providers.pop();
		Component.stack.pop();
		$.render();
		return ret;
	};
};

$.on = function(type, action){
	return function(element){
		element["on" + type] = $.withComponent(action);
	};
};

$.effect = function(setter){
	Component.subscribe(setter);
	setter();
};

$.css = function(prop, getter){
	return function(element){
		var style = element.style;
		var oldValue = style[prop] = getter();
		Component.subscribe(function(){
			var value = getter();
			if( oldValue!==value )
				oldValue = style[prop] = value;
		});
	};
};

$.prop = function(prop, getter){
	return function(element){
		var oldValue = element[prop] = getter();
		Component.subscribe(function(){
			var value = getter();
			if( oldValue!==value )
				oldValue = element[prop] = value;
		});
	};
};

$.text = function(getter){
	var oldValue;
	var node = document.createTextNode(oldValue = getter());
	Component.subscribe(function(){
		var value = getter();
		if( oldValue!==value )
			oldValue = node.nodeValue = value;
	});
	return node;
};

$.component = function(){
	var component = Component.current();
	return {
		index: function(){
			return component.index;
		}
	};
};

$.unmount = function(func){
	Component.current().onDestroy.subscribe(func);
};

$.mount = function(func){
	mounts.push(func);
};

$.render = function(){
	var component = Component.stack[Component.stack.length - 1];
	while( component.parent && !component.stopEvents )
		component = component.parent;
	component.render();
	var n = mounts.length;
	if( n ){
		var m = mounts.splice(0, n);
		for(var i=0; i<n; ++i){
			m[i]();
		}
	}
};

function copyToArray(list){
	if( list.slice ) return list.slice(0);
	var length=list.length, array = new Array(length);
	for(var i=0; i<length; ++i){
		array[i] = list[i];
	}
	return array;
}

$.map = function(models, getView, stopRender){
	var ref = typeof models=="function" ? models() : models;
	var A = copyToArray(ref);
	var curr = new Component(stopRender).setParent( Component.current() );
	var placeholder = document.createTextNode("");
	var provider = providers[providers.length - 1];
	
	for(var i=0, l=A.length; i<l; ++i){
		new Component().setParent(curr).setIndex(i).setView(getView, A[i]);
	}
	curr.onRender.subscribe(function(){
		var B = typeof models=="function" ? models() : models;
		if( stopRender ){
			if( B===ref ){
				return;
			}else{
				ref = B;
			}
		}
		
		providers.push(provider);
		var parent = placeholder.parentNode;
		
		var i, n=A.length, m=B.length;
		for(i=0; i<n; ++i){
			if( i<m ){
				if( A[i]===B[i] ){
					continue;
				}
				if( i+1<m ){
					if( A[i]===B[i+1] ){
						curr.insertComponent(i, B[i], getView, parent);
						A.splice(i, 0, B[i++]); ++n;
						continue;
					}
					if( i+2<m ){
						if( A[i]===B[i+2] ){
							curr.insertComponent(i, B[i+1], getView, parent);
							curr.insertComponent(i, B[i], getView, parent);
							A.splice(i, 0, B[i++], B[i++]); n+=2;
							continue;
						}
						if( i+3<m && A[i]===B[i+3] ){
							curr.insertComponent(i, B[i+2], getView, parent);
							curr.insertComponent(i, B[i+1], getView, parent);
							curr.insertComponent(i, B[i], getView, parent);
							A.splice(i, 0, B[i++], B[i++], B[i++]); n+=3;
							continue;
						}
					}
				}
			}
			
			curr.removeComponent(i);
			A.splice(i, 1); --i; --n;
		}
		for(; i<m; ++i){
			curr.appendComponent(B[i], getView, parent, placeholder);
			A.push(B[i]);
		}
		for(i=0; i<m; ++i)
			curr.children[i].setIndex(i);
		
		providers.pop();
	});
	
	var ret = [];
	for(var i=0, l=curr.children.length; i<l; ++i){
		ret.push( curr.children[i].view );
	}
	ret.push(placeholder);
	return ret;
};

$.is = function(getter, getView, stopRender){
	var A = getter();
	var curr = new Component(stopRender).setParent( Component.current() );
	var placeholder = document.createTextNode("");
	var provider = providers[providers.length - 1];
	
	new Component().setParent(curr).setView(getView, A);
	
	curr.onRender.subscribe(function(){
		var B = getter();
		if( A===B )
			return;
		var parent = placeholder.parentNode;
		
		curr.removeComponent(0);
		providers.push(provider);
		curr.appendComponent(B, getView, parent, placeholder);
		providers.pop();
		
		A = B;
	});
	
	return [curr.children[0].view, placeholder];
};

$.guard = function(condition, getView){
	var curr = new Component().setParent( Component.current() );
	
	new Component().setParent(curr).setView(getView);
	
	curr.onRender.subscribe(function(){
		curr.stopRender = !condition();
	});
	
	return curr.children[0].view;
};

$.boundary = function(getView){
	var curr = new Component().setParent( Component.current() ).setView(getView);
	curr.stopEvents = true;
	return curr.view;
};

function Component(stopRender){
	this.view = null;
	this.parent = null;
	this.index = null;
	this.children = [];
	this.stopEvents = false;
	this.stopRender = !!stopRender;
	this.onRender = $.observable();
	this.onDestroy = $.observable();
}

Component.stack = [new Component()];

Component.current = function(){
	return this.stack[this.stack.length - 1];
};

Component.subscribe = function(fn){
	return this.current().onRender.subscribe(fn);
};

Component.prototype.setParent = function(parent){
	this.parent = parent;
	parent.children.push( this );
	return this;
};

Component.prototype.setIndex = function(index){
	this.index = index;
	return this;
};

Component.prototype.setView = function(getView, model){
	Component.stack.push(this);
	this.view = getView(model);
	Component.stack.pop();
	return this;
};

Component.prototype.removeComponent = function(index){
	var removed = this.children.splice(index, 1)[0];
	removed.parent = null;
	removed.remove();
	return this;
};

Component.prototype.remove = function(){
	var children = this.children;
	for(var i=0, l=children.length; i<l; ++i)
		children[i].remove();
	this.onDestroy();
	var view = this.view;
	if( view ){
		for(var i=0, l=view.length; i<l; ++i){
			var node = view[i];
			if( node.parentNode )
				node.parentNode.removeChild(node);
		}
	}
	return this;
};

Component.prototype.insertComponent = function(index, model, getView, parent){
	var component = new Component();
	component.parent = this;
	component.setView(getView, model);
	var next = this.children[index];
	var view = component.view;
	this.children.splice(index, 0, component);
	if( next && next.view ){
		var first = next.view;
		while( first[0] ) first = first[0];
		if( parent ){
			for(var i=0, l=view.length; i<l; ++i){
				parent.insertBefore(view[i], first);
			}
		}
	}
	return component;
};

Component.prototype.appendComponent = function(model, getView, parent, placeholder){
	var component = new Component();
	component.parent = this;
	component.setView(getView, model);
	var view = component.view;
	this.children.push(component);
	if( parent ){
		for(var i=0, l=view.length; i<l; ++i){
			parent.insertBefore(view[i], placeholder);
		}
	}
	return component;
};

Component.prototype.render = function(){
	this.onRender();
	if( this.stopRender )
		return this;
	
	var children = this.children;
	for(var i=0, l=children.length; i<l; ++i){
		children[i].render();
	}
	return this;
};

/* Dependency injection */

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

var providers = [new Provider(null, supportsWeakMap ? new WeakMap() : [])];

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
	var provider = providers[providers.length - 1];
	var container = null;
	while( provider && !(container = provider.getContainer(service)))
		provider = provider.parent;
	if(!provider){
		provider = providers[0];
		container = new Container(service);
		var containers = provider.containers;
		containers.set ? containers.set(service, container) : containers.push(container);
	}
	providers.push(provider);
	var instance = container.getInstance();
	providers.pop();
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
	var provider = new Provider(providers[providers.length - 1], containers);
	providers.push(provider);
	$.unmount(function(){
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
	var content = getContent();
	providers.pop();
	return content;
};

})($);

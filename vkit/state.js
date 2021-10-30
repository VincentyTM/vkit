(function($, undefined){

var renderComponentTree = $.component.render;
var stateUpdates = [];
var onMount = [];

function noop(x){
	return x;
}

function map(query){
	return $(this).combine(query || noop);
}

function pipe(state, transform){
	if(!transform) transform = noop;
	function update(value){
		state.set(transform(value));
	}
	this.effect(update);
	return this;
}

function input(query){
	return map.call(this, query).until($.unmount);
}

function select(prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		var state = this;
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return state.select(prop);
			}
		});
	}
	return map.call(this, function(value){
		return value ? value[prop] : undefined;
	});
}

function add(value){
	this.set(this.get() + value);
}

function toggle(){
	this.set(!this.get());
}

function apply(){
	var n = arguments.length;
	var value = this.get();
	for(var i=0; i<n; ++i){
		value = arguments[i].call(this, value);
	}
	this.set(value);
}

function text(){
	var node = document.createTextNode(this.get());
	this.onChange.subscribe(function(value){
		node.nodeValue = value;
	});
	return node;
}

function prop(key){
	var value = this.get();
	var onChange = this.onChange;
	return function(node){
		node[key] = value;
		onChange.subscribe(function(value){
			node[key] = value;
		});
	};
}

function css(key){
	var value = this.get();
	var onChange = this.onChange;
	return function(node){
		node.style[key] = value;
		onChange.subscribe(function(value){
			node.style[key] = value;
		});
	};
}

function effect(action){
	action(this.get());
	this.onChange.subscribe(action);
}

function switchStateView(components, defaultComponent){
	return getStateView.call(this, function(key){
		return (components[key] || defaultComponent)();
	});
}

function getStateView(getView, immutable){
	return $.is(this.get(), getView, immutable, this.onChange);
}

function mapStateView(getView, immutable){
	return $.map(this.get(), getView, immutable, this.onChange);
}

$.state = function(value){
	var oldValue = value;
	var onChange = $.observable();
	
	function update(){
		if( value !== oldValue ){
			onChange(oldValue = value);
		}
	}
	
	update.queued = false;
	
	function get(){
		return value;
	}
	
	function set(newValue){
		if( value !== newValue ){
			value = newValue;
			if(!update.queued){
				update.queued = true;
				stateUpdates.push(update);
			}
		}
	}
	
	return {
		set: set,
		apply: apply,
		add: add,
		toggle: toggle,
		get: get,
		map: map,
		pipe: pipe,
		input: input,
		select: select,
		onChange: onChange,
		text: text,
		prop: prop,
		css: css,
		effect: effect,
		view: getStateView,
		views: mapStateView,
		switchView: switchStateView
	};
};

$.fn.combine = function(func){
	function getValue(){
		var values = new Array(n);
		for(var i=0; i<n; ++i){
			values[i] = states[i].get();
		}
		return func.apply(null, values);
	}
	
	function update(){
		var newValue = getValue();
		if( value !== newValue ){
			onChange(value = newValue);
		}
	}
	
	function unsubscribe(){
		for(var i=0; i<n; ++i){
			unsubscribes[i]();
		}
	}
	
	function until(func){
		func(unsubscribe);
		return this;
	}
	
	var states = this, n = states.length;
	var value = getValue();
	var onChange = $.observable();
	var unsubscribes = new Array(n);
	
	for(var i=0; i<n; ++i){
		unsubscribes[i] = states[i].onChange.subscribe(update);
	}
	
	return {
		get: getValue,
		map: map,
		pipe: pipe,
		input: input,
		select: select,
		update: update,
		onChange: onChange,
		text: text,
		prop: prop,
		css: css,
		effect: effect,
		view: getStateView,
		views: mapStateView,
		switchView: switchStateView,
		unsubscribe: unsubscribe,
		until: until
	};
};

$.mount = function(func){
	return onMount.push(func);
};

$.render = function(){
	var n;
	while( n = stateUpdates.length ){
		var updates = stateUpdates.splice(0, n);
		for(var i=0; i<n; ++i){
			var update = updates[i];
			update.queued = false;
			update();
		}
	}
	renderComponentTree();
	n = onMount.length;
	if( n ){
		var updates = onMount.splice(0, n);
		for(var i=0; i<n; ++i){
			updates[i]();
		}
	}
};

$.on = function(type, action){
	return function(element){
		element["on" + type] = function(){
			var ret = action.apply(this, arguments);
			$.render();
			return ret;
		};
	};
};

})($);

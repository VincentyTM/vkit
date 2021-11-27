(function($, undefined){

var stateUpdates = [];

function noop(x){
	return x;
}

function map(transform){
	return $(this).combine(transform || noop);
}

function pipe(state, transform){
	if(!transform) transform = noop;
	function update(value){
		state.set(transform(value));
	}
	this.effect(update);
	return this;
}

function input(transform){
	var value = this.get();
	var state = createState(transform ? transform(value) : value);
	var set = state.set;
	state.set = this.set;
	function onChange(value){
		set(transform(value));
	}
	$.unmount(this.onChange.subscribe(transform ? onChange : set));
	return state;
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

function createState(value){
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
	
	function enqueue(){
		if(!update.queued){
			update.queued = true;
			stateUpdates.push(update);
		}
	}
	
	function set(newValue){
		if( value !== newValue ){
			value = newValue;
			enqueue();
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
		enqueue: enqueue,
		text: text,
		prop: prop,
		css: css,
		effect: effect,
		view: getStateView,
		views: mapStateView,
		switchView: switchStateView
	};
}

function combineStates(func){
	function getValue(){
		var n = states.length;
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
		var n = unsubscribes.length;
		for(var i=0; i<n; ++i){
			unsubscribes[i]();
		}
	}
	
	function addDependency(){
		var n = arguments.length;
		for(var i=0; i<n; ++i){
			var arg = arguments[i];
			unsubscribes.push(arg.subscribe ? arg.subscribe(update) : arg.onChange.subscribe(update));
		}
		return this;
	}
	
	function until(func){
		func(unsubscribe);
		return this;
	}
	
	var states = this, n = states.length;
	var value = getValue();
	var onChange = $.observable();
	var unsubscribes = [];
	
	for(var i=0; i<n; ++i){
		var state = states[i];
		if( state && state.onChange && typeof state.onChange.subscribe === "function" ){
			unsubscribes.push(state.onChange.subscribe(update));
		}
	}
	
	return {
		get: getValue,
		map: map,
		pipe: pipe,
		input: input,
		select: select,
		update: update,
		onChange: onChange,
		addDependency: addDependency,
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
}

function renderStates(){
	var n;
	while( n = stateUpdates.length ){
		var updates = stateUpdates.splice(0, n);
		for(var i=0; i<n; ++i){
			var update = updates[i];
			update.queued = false;
			update();
		}
	}
}

$.state = createState;
$.state.render = renderStates;
$.state.updateQueue = stateUpdates;
$.fn.combine = combineStates;

})($);

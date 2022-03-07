(function($, document, undefined){

var createObservable = $.observable;
var getComponent = $.component;
var toView = $.view;
var toViews = $.views;
var unmount = $.unmount;
var stateUpdates = [];

function subscribe(state, callback){
	var unsubscribe = state.onChange.subscribe(callback);
	if( state.component !== getComponent() ){
		unmount(unsubscribe);
	}
	return unsubscribe;
}

function getOnChange(state){
	if( state.component === getComponent() ){
		return state.onChange;
	}else{
		var onChange = createObservable();
		unmount(state.onChange.subscribe(onChange));
		return onChange;
	}
}

function map(){
	var args = arguments, n = args.length;
	function transform(x){
		for(var i=0; i<n; ++i){
			x = args[i](x);
		}
		return x;
	}
	return $(this).combine(n === 1 ? args[0] : transform);
}

function pipe(state, transform){
	function update(value){
		state.set(transform ? transform(value) : value);
	}
	this.effect(update);
	return this;
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
	subscribe(this, function(value){
		node.nodeValue = String(value);
	});
	return node;
}

function prop(key){
	var value = this.get();
	var state = this;
	return function(node){
		node[key] = value;
		subscribe(state, function(value){
			node[key] = value;
		});
	};
}

function style(key){
	var value = this.get();
	var state = this;
	return function(node){
		node.style[key] = value;
		subscribe(state, function(value){
			node.style[key] = value;
		});
	};
}

function effect(action){
	action(this.get());
	subscribe(this, action);
}

function getStateView(getView, immutable){
	return toView(this.get(), getView, immutable, getOnChange(this));
}

function getStateViews(getView, immutable){
	return toViews(this.get(), getView, immutable, getOnChange(this));
}

function createState(value){
	var oldValue = value;
	var onChange = createObservable();
	
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
	
	function dequeue(){
		if( update.queued ){
			update.queued = false;
			for(var i=stateUpdates.length; i--;){
				if( stateUpdates[i] === update ){
					stateUpdates.splice(i, 1);
					break;
				}
			}
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
		select: select,
		onChange: onChange,
		enqueue: enqueue,
		dequeue: dequeue,
		text: text,
		prop: prop,
		style: style,
		effect: effect,
		view: getStateView,
		views: getStateViews,
		component: getComponent()
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
	
	var states = this, n = states.length;
	var value = getValue();
	var onChange = createObservable();
	var unsubscribes = [];
	var component = getComponent();
	var autoUnsubscribe = false;
	
	for(var i=0; i<n; ++i){
		var state = states[i];
		if( state && state.onChange && typeof state.onChange.subscribe === "function" ){
			unsubscribes.push(state.onChange.subscribe(update));
			if( state.component !== component ){
				autoUnsubscribe = true;
			}
		}
	}
	
	if( autoUnsubscribe ){
		unmount(unsubscribe);
	}
	
	return {
		get: getValue,
		map: map,
		pipe: pipe,
		select: select,
		update: update,
		onChange: onChange,
		addDependency: addDependency,
		text: text,
		prop: prop,
		style: style,
		effect: effect,
		view: getStateView,
		views: getStateViews,
		unsubscribe: unsubscribe,
		component: component
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

})($, document);

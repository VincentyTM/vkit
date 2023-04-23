(function($, document, undefined){

var createObservable = $.observable;
var getComponent = $.getComponent;
var setComponent = $.setComponent;
var toView = $.view;
var toViews = $.views;
var unmount = $.unmount;
var stateUpdates = [];

function subscribe(state, callback){
	var unsubscribe = state.onChange.subscribe(callback);
	var component = getComponent(true);
	if( state.component !== component ){
		if(!component){
			throw new Error("Some source states are created in components, but not the destination");
		}
		unmount(unsubscribe);
	}
	return unsubscribe;
}

function subscribeToThis(callback){
	return subscribe(this, callback);
}

function getOnChange(state){
	var component = getComponent(true);
	if( state.component === component ){
		return state.onChange;
	}else{
		if(!component){
			throw new Error("Some source states are created in components, but not the destination view");
		}
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
	return $(this).map(n === 1 ? args[0] : transform);
}

function pipe(state, transform){
	function update(value){
		state.set(transform ? transform(value, state.get()) : value);
	}
	this.effect(update);
	return this;
}

function add(value){
	return this.set(this.get() + value);
}

function toggle(){
	return this.set(!this.get());
}

function apply(){
	var n = arguments.length;
	var value = this.get();
	for(var i=0; i<n; ++i){
		value = arguments[i].call(this, value);
	}
	return this.set(value);
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

function effect(action){
	var prev = getComponent(true);
	if( prev ){
		var cleanup = createObservable();
		unmount(cleanup);
		var unsubscribe = subscribe(this, function(value){
			cleanup();
			cleanup.clear();
			action(value, cleanup.subscribe);
		});
		setComponent(null);
		action(this.get(), cleanup.subscribe);
		setComponent(prev);
		return unsubscribe;
	}else{
		action(this.get());
		return subscribe(this, function(value){
			action(value);
		});
	}
}

function flatten(){
	var output = createState();
	this.effect(function(inner, cleanup){
		if( inner && typeof inner.get === "function" ){
			output.set(inner.get());
			if( inner.onChange && typeof inner.onChange.subscribe === "function" ){
				cleanup(
					inner.onChange.subscribe(function(value){
						output.set(value);
					})
				);
			}
		}else{
			output.set(inner);
		}
	});
	return output.map();
}

function getStateView(getView, immutable){
	return toView(this.get(), getView, immutable, getOnChange(this));
}

function getStateViews(getView, immutable){
	return toViews(this.get(), getView, immutable, getOnChange(this));
}

function createConstState(value){
	function get(){
		return value;
	}
	return {get: get};
}

function createState(value){
	var oldValue = value;
	var onChange = createObservable();
	var queued = false;
	
	function update(){
		queued = false;
		if( value !== oldValue ){
			onChange(oldValue = value);
		}
	}
	
	function get(){
		return value;
	}
	
	function enqueue(){
		if(!queued){
			queued = true;
			stateUpdates.push(update);
		}
		return this;
	}
	
	function dequeue(){
		if( queued ){
			queued = false;
			for(var i=stateUpdates.length; i--;){
				if( stateUpdates[i] === update ){
					stateUpdates.splice(i, 1);
					break;
				}
			}
		}
		return this;
	}
	
	function set(newValue){
		if( value !== newValue ){
			value = newValue;
			enqueue();
		}
		return this;
	}
	
	function mutate(newValue){
		oldValue = NaN;
		value = newValue;
		enqueue();
		return this;
	}
	
	return {
		set: set,
		apply: apply,
		add: add,
		toggle: toggle,
		get: get,
		map: map,
		pipe: pipe,
		flatten: flatten,
		mutate: mutate,
		onChange: onChange,
		enqueue: enqueue,
		dequeue: dequeue,
		render: text,
		text: text,
		prop: prop,
		effect: effect,
		view: getStateView,
		views: getStateViews,
		subscribe: subscribeToThis,
		component: getComponent(true)
	};
}

function combineStates(combine){
	function computeValue(){
		var n = states.length;
		var values = new Array(n);
		for(var i=0; i<n; ++i){
			values[i] = states[i].get();
		}
		return combine.apply(null, values);
	}
	
	function update(){
		var newValue = computeValue();
		if( value !== newValue || mutated ){
			mutated = false;
			onChange(value = newValue);
		}
		return this;
	}
	
	function unsubscribe(){
		var n = unsubscribes.length;
		for(var i=0; i<n; ++i){
			unsubscribes[i]();
		}
		return this;
	}
	
	function mutate(){
		mutated = true;
	}
	
	function getValue(){
		return value;
	}
	
	var states = this, n = states.length;
	var mutated = false;
	var onChange = createObservable();
	var unsubscribes = [];
	var component = getComponent(true);
	var autoUnsubscribe = false;
	var hasNonState = false;
	
	for(var i=0; i<n; ++i){
		var state = states[i];
		if( state && state.onChange && typeof state.onChange.subscribe === "function" ){
			var unsub = state.onChange.subscribe(update);
			if( state.component !== component ){
				unsubscribes.push(unsub);
				autoUnsubscribe = true;
			}
		}
		if(!(state && typeof state.get === "function")){
			hasNonState = true;
		}
	}
	
	if( autoUnsubscribe ){
		if(!component){
			throw new Error("Some source states are created in components, but not the destination state");
		}
		unmount(unsubscribe);
	}
	
	if( hasNonState ){
		states = new Array(n);
		for(var i=0; i<n; ++i){
			var state = this[i];
			states[i] = state && typeof state.get === "function" ? state : createConstState(state);
		}
	}
	
	var prev = getComponent(true);
	setComponent(null);
	var value = computeValue();
	setComponent(prev);
	
	return {
		get: getValue,
		map: map,
		pipe: pipe,
		flatten: flatten,
		mutate: mutate,
		onChange: onChange,
		render: text,
		text: text,
		prop: prop,
		effect: effect,
		view: getStateView,
		views: getStateViews,
		subscribe: subscribeToThis,
		unsubscribe: unsubscribe,
		component: component
	};
}

function renderStates(){
	var n;
	while( n = stateUpdates.length ){
		var updates = stateUpdates.splice(0, n);
		for(var i=0; i<n; ++i){
			updates[i]();
		}
	}
}

function getArgs(){
	return arguments;
}

function combineView(getView){
	return this.map(getArgs).view(function(args){
		return getView.apply(null, args);
	});
}

function combineEffect(action){
	this.map(getArgs).effect(function(args){
		action.apply(null, args);
	});
	return this;
}

$.state = createState;
$.renderStates = renderStates;
$.stateUpdateQueue = stateUpdates;
$.fn.map = combineStates;
$.fn.view = combineView;
$.fn.effect = combineEffect;

})($, document);

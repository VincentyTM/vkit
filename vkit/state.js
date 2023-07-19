(function($, undefined){

var createObservable = $.observable;
var dequeueUpdate = $.dequeueUpdate;
var enqueueUpdate = $.enqueueUpdate;
var getComponent = $.getComponent;
var prop = $.signalProp;
var setComponent = $.setComponent;
var text = $.signalText;
var unmount = $.unmount;
var view = $.view;
var views = $.views;

function toString(){
	return "[object State(" + this.get() + ")]";
}

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

function map(){
	var args = arguments, n = args.length;
	function transform(x){
		for(var i=0; i<n; ++i){
			x = args[i](x);
		}
		return x;
	}
	return combineStates.call([this], n === 1 ? args[0] : transform);
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
			enqueueUpdate(update);
		}
		return this;
	}
	
	function dequeue(){
		if( queued ){
			queued = false;
			dequeueUpdate(update);
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
	
	return {
		set: set,
		apply: apply,
		add: add,
		toggle: toggle,
		get: get,
		map: map,
		pipe: pipe,
		flatten: flatten,
		onChange: onChange,
		enqueue: enqueue,
		dequeue: dequeue,
		render: text,
		prop: prop,
		effect: effect,
		view: view,
		views: views,
		subscribe: subscribeToThis,
		component: getComponent(true),
		toString: toString
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
		if( value !== newValue ){
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
	
	function getValue(){
		return value;
	}
	
	var states = this, n = states.length;
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
		onChange: onChange,
		render: text,
		prop: prop,
		effect: effect,
		update: update,
		view: view,
		views: views,
		subscribe: subscribeToThis,
		unsubscribe: unsubscribe,
		component: component,
		toString: toString
	};
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
$.fn.map = combineStates;
$.fn.view = combineView;
$.fn.effect = combineEffect;

})($);

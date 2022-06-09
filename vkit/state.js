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
	return this;
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
		return this;
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
		return this;
	}
	
	function unsubscribe(){
		var n = unsubscribes.length;
		for(var i=0; i<n; ++i){
			unsubscribes[i]();
		}
		return this;
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
$.state.render = renderStates;
$.state.updateQueue = stateUpdates;
$.fn.map = combineStates;
$.fn.view = combineView;
$.fn.effect = combineEffect;

})($, document);

(function($, g){

var createObservable = $.observable;
var unmount = $.unmount;
var toView = $.view;
var toViews = $.views;

var queueMicrotask = g.queueMicrotask || (typeof Promise === "function" && typeof Promise.resolve === "function"
	? function(callback){ Promise.resolve().then(callback); }
	: function(callback){ setTimeout(callback, 0); });

var currentDestination = null;
var updateQueue = [];

function callAllOnce(array){
	var n = array.length;
	if( n > 0 ){
		var items = array.splice(0, n);
		for(var i=0; i<n; ++i){
			items[i]();
		}
	}
}

function addItem(array, item){
	for(var i=array.length; i--;){
		if( array[i] === item ){
			return;
		}
	}
	array.push(item);
}

function renderSignals(){
	callAllOnce(updateQueue);
}

function enqueueUpdate(callback){
	updateQueue.push(callback);
	
	if( updateQueue.length === 1 ){
		queueMicrotask(renderSignals);
	}
}

function view(getView, immutable){
	var signal = this;
	var valueChanged = createObservable();
	
	createSignalEffect(function(){
		valueChanged(signal());
	});
	
	return toView(this.get(), getView, immutable, valueChanged);
}

function views(getView, immutable){
	var signal = this;
	var valueChanged = createObservable();
	
	createSignalEffect(function(){
		valueChanged(signal());
	});
	
	return toViews(this.get(), getView, immutable, valueChanged);
}

function render(){
	var signal = this;
	var text = document.createTextNode(this.get());
	
	createSignalEffect(function(){
		text.nodeValue = signal();
	});
	
	return text;
}

function prop(propName){
	var signal = this;
	
	return function(el){
		createSignalEffect(function(){
			el[propName] = signal();
		});
	};
}

function style(cssPropName){
	var signal = this;
	
	return function(el){
		createSignalEffect(function(){
			el.style[cssPropName] = signal();
		});
	};
}

function update(transform){
	this.set(transform(this.get()));
}

function equal(a, b){
	return a === b;
}

function createWritableSignal(value, options){
	var renderedValue = value;
	var dependents = [];
	var unmounted = false;
	var enqueued = false;
	var mutated = false;
	var eq = options && typeof options.equal === "function" ? options.equal : equal;
	
	function signal(){
		if( unmounted ){
			throw new Error("Cannot use unmounted signal");
		}
		
		var d = currentDestination;
		if( d ){
			addItem(dependents, d);
		}
		
		return value;
	}
	
	function updateDependents(){
		enqueued = false;
		
		if( unmounted ){
			return;
		}
		
		if( mutated || !eq(value, renderedValue) ){
			mutated = false;
			renderedValue = value;
			callAllOnce(dependents);
		}
	}
	
	function set(newValue){
		if( mutated || !eq(value, newValue) ){
			value = newValue;
			
			if(!enqueued){
				enqueued = true;
				enqueueUpdate(updateDependents);
			}
		}
	}
	
	function mutate(callback){
		mutated = true;
		callback(value);
		
		if(!enqueued){
			enqueued = true;
			enqueueUpdate(updateDependents);
		}
	}
	
	function get(){
		return value;
	}
	
	(options && options.cleanup ? options.cleanup : unmount)(function(){
		unmounted = true;
		dependents.splice(0, dependents.length);
	});
	
	signal.get = get;
	signal.mutate = mutate;
	signal.prop = prop;
	signal.render = render;
	signal.set = set;
	signal.style = style;
	signal.update = update;
	signal.valueOf = signal;
	signal.view = view;
	signal.views = views;
	
	return signal;
}

function createSignalEffect(callback, options){
	var cleanup = createObservable();
	
	createComputedSignal(function(){
		cleanup();
		cleanup.clear();
		return callback(cleanup.subscribe);
	}, options)();
	
	if( options && options.cleanup ){
		options.cleanup(cleanup);
	}else{
		unmount(cleanup);
	}
}

function createComputedSignal(getter, options){
	var value;
	var dependents = [];
	var unmounted = false;
	var eq = options && typeof options.equal === "function" ? options.equal : equal;

	function signal(){
		if( unmounted ){
			throw new Error("Cannot use unmounted signal");
		}
		
		var d = currentDestination;
		if( d ){
			addItem(dependents, d);
		}
		
		updateDependents();
		
		return value;
	}
	
	function updateDependents(){
		if( unmounted ){
			return;
		}
		
		var prev = currentDestination;
		
		try{
			currentDestination = updateDependents;
			var newValue = getter();
			
			if(!eq(value, newValue)){
				value = newValue;
				callAllOnce(dependents);
			}
		}finally{
			currentDestination = prev;
		}
	}
	
	function get(){
		return value;
	}
	
	(options && options.cleanup ? options.cleanup : unmount)(function(){
		unmounted = true;
		dependents.splice(0, dependents.length);
	});
	
	signal.get = get;
	signal.prop = prop;
	signal.render = render;
	signal.style = style;
	signal.valueOf = signal;
	signal.view = view;
	signal.views = views;
	
	return signal;
}

function untracked(callback){
	var prev = currentDestination;
	
	try{
		currentDestination = null;
		return callback();
	}finally{
		currentDestination = prev;
	}
}

$.signal = {
	computed: createComputedSignal,
	effect: createSignalEffect,
	signal: createWritableSignal,
	untracked: untracked
};

})($, this);

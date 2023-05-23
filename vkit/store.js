(function($, undefined){

var compose = $.compose;
var createObservable = $.observable;
var createState = $.state;
var getComponent = $.getComponent;
var inject = $.inject;
var onChange = $.onChange;
var setComponent = $.setComponent;
var unmount = $.unmount;
var toString = Object.prototype.toString;

function isState(value){
	return Boolean(value) && typeof value.effect === "function";
}

function isArray(object){
	return toString.call(object) === "[object Array]";
}

function select(key, factory){
	var parent = this;
	if( key === undefined || key === null ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		return new Proxy({}, {
			get: function(target, key, receiver){
				return select.call(parent, key);
			}
		});
	}
	
	var substore = parent.substores[key];
	if( substore ){
		++substore.refCount;
	}else{
		var prev = getComponent();
		setComponent(parent.component);
		
		var child = createState();
		var value = typeof factory === "function" ? factory(child) : undefined;
		var object = parent.get();
		if(!object){
			
		}else if(!isArray(object)){
			if( object[key] === undefined && value !== undefined ){
				object[key] = value;
			}
		}
		var cleanup = createObservable();
		
		function addChangeHandler(object, i){
			cleanup.subscribe(
				onChange(object, key).subscribe(function(value){
					var values = child.get();
					child.set(values.slice(0, i).concat([value]).concat(values.slice(i + 1)));
				})
			);
		}
		
		function addChangeHandlers(array){
			var n = array.length;
			var value = new Array(n);
			for(var i=0; i<n; ++i){
				var object = array[i];
				value[i] = object[key];
				addChangeHandler(object, i);
			}
			return value;
		}
		
		function updateObject(object){
			cleanup();
			cleanup.clear();
			if( isArray(object) ){
				child.set(addChangeHandlers(object));
			}else if( object ){
				var observable = onChange(object, key);
				if(!observable){
					throw new ReferenceError("Property '" + key + "' does not exist");
				}
				child.set(object[key]);
				cleanup.subscribe(
					observable.subscribe(function(value){
						child.set(value);
					})
				);
			}else{
				child.set(null);
			}
		}
		
		function updateValue(value){
			var object = parent.get();
			if( object ){
				object[key] = value;
			}
		}
		
		updateObject(parent.get());
		
		substore = parent.substores[key] = {
			refCount: 1,
			store: createStore(child),
			unsubscribe: compose(
				parent.onChange.subscribe(updateObject),
				child.onChange.subscribe(updateValue),
				cleanup
			)
		};
		
		setComponent(prev);
	}
	
	unmount(function(){
		if( --substore.refCount === 0 ){
			delete parent.substores[key];
			substore.unsubscribe();
		}
	});
	
	return substore.store;
}

function item(value, factory){
	var store = createStore(value);
	if( typeof factory === "function" ){
		factory(store);
	}
	return store;
}

function createStore(state){
	if(!isState(state)){
		state = createState(state);
	}
	state.item = item;
	state.select = select;
	state.substores = {};
	return state;
}

function Store(){
	if(!(this instanceof Store)){
		return inject(Store).store;
	}
	this.store = createStore({});
}

$.rootStore = Store;
$.store = createStore;

})($);

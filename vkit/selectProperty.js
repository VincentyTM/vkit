(function($, undefined){

var compose = $.compose;
var createObservable = $.observable;
var createSignal = $.signal;
var getComponent = $.getComponent;
var isArray = $.isArray;
var onChange = $.onChange;
var setComponent = $.setComponent;
var unmount = $.unmount;

function select(key, factory){
	return selectProperty(this, key, factory);
}

function selectProperty(parent, key, factory){
	if( key === undefined || key === null ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		
		return new Proxy({}, {
			get: function(target, key, receiver){
				return selectProperty(parent, key);
			}
		});
	}
	
	if(!parent.substores){
		parent.substores = {};
	}
	
	var substore = parent.substores[key];
	
	if( substore ){
		++substore.refCount;
	}else{
		var prev = getComponent();
		setComponent(parent.component);
		
		var child = createSignal();
		var value = typeof factory === "function" ? factory() : undefined;
		var object = parent.get();
		
		if( object && !isArray(object) ){
			if( object[key] === undefined && value !== undefined ){
				object[key] = value;
			}
		}
		
		child.select = select;
		
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
			store: child,
			unsubscribe: compose(
				parent.subscribe(updateObject, true),
				child.subscribe(updateValue, true),
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

$.selectProperty = selectProperty;

})($);

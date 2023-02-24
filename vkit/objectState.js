(function($, undefined){

var map = $.map;
var unmount = $.unmount;
var onChange = $.onChange;
var createState = $.state;
var createObservable = $.observable;

function createObjectState(parent, methods){
	if( typeof parent === "function" ){
		parent = createState(parent());
	}else if(!parent || typeof parent.get !== "function"){
		parent = createState(parent);
	}
	if(!methods){
		methods = {};
	}
	var set = parent.set;
	
	for(var k in methods){
		parent[k] = patchMethod(methods[k]);
	}
	
	function patchMethod(method){
		return function(){
			var result = method.apply(parent.get(), arguments);
			if( result !== undefined ){
				set.call(parent, result);
			}
		};
	}
	
	function item(value, reducer){
		var child = createObjectState(value, reducer);
		child.subscribe(function(){
			parent.mutate(parent.get());
		});
		return child;
	}
	
	function select(key, initialValue, reducer){
		if( key === undefined || key === null ){
			if( typeof Proxy !== "function" ){
				throw new ReferenceError("Proxy is not supported in your browser!");
			}
			return new Proxy({}, {
				get: function(target, prop, receiver){
					return select(prop, initialValue, reducer);
				}
			});
		}
		if(!reducer){
			reducer = initialValue;
			initialValue = undefined;
		}
		var object = parent.get();
		var value = object ? object[key] : undefined;
		if( value === undefined ){
			value = initialValue;
			if( object ){
				object[key] = value;
			}
		}
		if( typeof value === "function" ){
			var func = map(function(object){
				return object ? object[key].apply(object, Array.prototype.slice.call(arguments, 1)) : undefined;
			});
			return function(){
				return item(func.apply(null, [parent].concat(Array.prototype.slice.call(arguments))));
			};
		}
		var child = createObjectState(value, reducer);
		child.subscribe(function(value){
			var object = parent.get();
			if( object ){
				object[key] = value;
				parent.mutate(object);
			}
		});
		parent.subscribe(function(object){
			if( object ){
				child.set(object[key]);
			}
		});
		var stopObserving = createObservable();
		parent.effect(function(object){
			stopObserving();
			stopObserving.clear();
			if( object ){
				stopObserving.subscribe(
					onChange(object, key).subscribe(function(value){
						child.set(value);
					})
				);
			}
		});
		unmount(function(){
			stopObserving();
			stopObserving.clear();
		});
		return child;
	}
	
	function selectEach(key, reducer){
		if( key === undefined || key === null ){
			if( typeof Proxy !== "function" ){
				throw new ReferenceError("Proxy is not supported in your browser!");
			}
			return new Proxy({}, {
				get: function(target, prop, receiver){
					return selectEach(prop, reducer);
				}
			});
		}
				
		function addChangeHandler(object, i){
			stopObserving.subscribe(
				onChange(object, key).subscribe(function(value){
					var values = child.get();
					child.set(values.slice(0, i).concat([value]).concat(values.slice(i + 1)));
				})
			);
		}

		function addChangeHandlers(array){
			stopObserving.clear();
			if(!array){
				return undefined;
			}
			var n = array.length;
			var value = new Array(n);
			for(var i=0; i<n; ++i){
				var object = array[i];
				value[i] = object[key];
				addChangeHandler(object, i);
			}
			return value;
		}
		
		var stopObserving = createObservable();
		var child = item(addChangeHandlers(parent.get()), reducer);
		var value = parent.get();
		parent.subscribe(function(array){
			if( value !== array ){
				value = array;
				stopObserving();
				child.set(addChangeHandlers(array));
			}
		});
		unmount(function(){
			stopObserving();
			stopObserving.clear();
		});
		return child;
	}
	
	parent.item = item;
	parent.select = select;
	parent.selectEach = selectEach;
	
	return parent;
}

$.objectState = createObjectState;

})($);

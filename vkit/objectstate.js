(function($, undefined){

var map = $.map;
var unmount = $.unmount;
var createState = $.state;
var createObservable = $.observable;

function createObjectState(parent, methods){
	if(!parent || typeof parent.get !== "function"){
		parent = createState(parent);
	}
	if(!methods){
		methods = {};
	}
	var onMutate = createObservable();
	var set = parent.set;
	
	function Actions(){}
	if( parent.actions ){
		Actions.prototype = parent.actions;
	}
	var actions = new Actions();
	for(var k in methods){
		parent[k] = actions[k] = patchMethod(methods[k]);
	}
	
	function patchMethod(method){
		return function(){
			var result = method.apply(parent.get(), arguments);
			if( result === undefined ){
				mutate();
			}else{
				set.call(parent, result);
			}
		};
	}
	
	function mutate(modify){
		var value = parent.get();
		if( modify ){
			modify(value);
		}
		parent.onChange(value);
		onMutate();
	}
	
	function item(value, reducer){
		var child = createObjectState(value, reducer);
		child.subscribe(function(value){
			parent.onChange(parent.get());
		});
		var unsubscribe = onMutate.subscribe(child.onMutate);
		if( parent.component !== child.component ){
			unmount(unsubscribe);
		}
		if(!reducer){
			child.actions = actions;
		}
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
		var value = object[key];
		if( value === undefined ){
			object[key] = value = initialValue;
		}
		if( typeof value === "function" ){
			var func = map(function(value){
				return value[key].apply(value, Array.prototype.slice.call(arguments, 1));
			});
			return function(){
				return item(func.apply(null, [parent].concat(Array.prototype.slice.call(arguments))));
			};
		}
		var child = createObjectState(value, reducer);
		child.subscribe(function(value){
			var object = parent.get();
			object[key] = value;
			parent.onChange(object);
		});
		parent.subscribe(function(object){
			child.set(object[key]);
		});
		var unsubscribe = onMutate.subscribe(function(){
			var newValue = parent.get()[key];
			child
				.set(newValue)
				.dequeue()
				.onChange(newValue);
			child.onMutate();
		});
		if( parent.component !== child.component ){
			unmount(unsubscribe);
		}
		if(!reducer){
			child.actions = actions;
		}
		return child;
	}
	
	parent.actions = actions;
	parent.item = item;
	parent.select = select;
	parent.mutate = mutate;
	parent.onMutate = onMutate;
	
	return parent;
}

$.objectState = createObjectState;

})($);

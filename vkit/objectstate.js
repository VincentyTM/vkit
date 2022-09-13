(function($, undefined){

var unmount = $.unmount;
var createState = $.state;
var createObservable = $.observable;

function createObjectState(parent, methods){
	if(!parent || typeof parent.get !== "function"){
		parent = createState(parent);
	}
	var onMutate = createObservable();
	
	function Dispatch(){}
	if( parent.dispatch ){
		Dispatch.prototype = parent.dispatch;
	}
	var dispatch = new Dispatch();
	for(var k in methods){
		dispatch[k] = patchMethod(methods[k]);
	}
	
	function patchMethod(method){
		return function(){
			var result = method.apply(parent.get(), arguments);
			if( result === undefined ){
				mutate();
			}else{
				parent.set(result);
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
		child.onChange.subscribe(function(value){
			parent.onChange(parent.get());
		});
		var unsubscribe = onMutate.subscribe(child.onMutate);
		if( parent.component !== child.component ){
			unmount(unsubscribe);
		}
		if(!reducer){
			child.dispatch = dispatch;
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
		var child = createObjectState(value, reducer);
		child.onChange.subscribe(function(value){
			var object = parent.get();
			object[key] = value;
			parent.onChange(object);
		});
		parent.subscribe(function(object){
			child.set(object[key]);
		});
		var unsubscribe = onMutate.subscribe(function(){
			child.set(parent.get()[key]);
			child.onMutate();
		});
		if( parent.component !== child.component ){
			unmount(unsubscribe);
		}
		if(!reducer){
			child.dispatch = dispatch;
		}
		return child;
	}
	
	parent.dispatch = dispatch;
	parent.item = item;
	parent.select = select;
	parent.mutate = mutate;
	parent.onMutate = onMutate;
	
	return parent;
}

$.objectState = createObjectState;

})($);

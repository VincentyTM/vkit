(function($, undefined){

var unmount = $.unmount;
var createState = $.state;
var createObservable = $.observable;

function createObjectState(parent, methods){
	if(!parent || typeof parent.get !== "function"){
		parent = createState(parent);
	}
	var view = parent.view;
	var views = parent.views;
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
	
	function create(value, reducer){
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
	
	function select(key, reducer){
		if( key === undefined || key === null ){
			if( typeof Proxy !== "function" ){
				throw new ReferenceError("Proxy is not supported in your browser!");
			}
			return new Proxy({}, {
				get: function(target, prop, receiver){
					return select(prop, reducer);
				}
			});
		}
		var child = createObjectState(undefined, reducer);
		child.onChange.subscribe(function(value){
			var object = parent.get();
			object[key] = value;
			parent.onChange(object);
		});
		parent.effect(function(object){
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
	
	function getStateView(getView){
		return view.call(parent, function(value){
			return getView(parent);
		});
	}
	
	function getStateViews(getView){
		return views.call(parent, function(item){
			return getView(create(item));
		});
	}
	
	parent.view = getStateView;
	parent.views = getStateViews;
	parent.dispatch = dispatch;
	parent.create = create;
	parent.select = select;
	parent.mutate = mutate;
	parent.onMutate = onMutate;
	
	return parent;
}

$.objectState = createObjectState;

})($);

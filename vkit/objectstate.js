(function($, undefined){

var unmount = $.unmount;
var createState = $.state;
var createObservable = $.observable;

function createObjectState(initialValue, reducer){
	var parent = createState(initialValue);
	var view = parent.view;
	var views = parent.views;
	var onMutate = createObservable();
	
	function dispatch(action){
		var result = reducer(parent.get(), action, this.get());
		if( result === undefined ){
			mutate();
		}else{
			parent.set(result);
		}
	}
	
	function mutate(modify){
		var value = parent.get();
		if( modify ){
			modify(value);
		}
		parent.onChange(value);
		onMutate();
	}
	
	function create(value){
		var child = createObjectState(value);
		child.onChange.subscribe(function(value){
			parent.onChange(parent.get());
		});
		var unsubscribe = onMutate.subscribe(child.onMutate);
		if( parent.component !== child.component ){
			unmount(unsubscribe);
		}
		child.dispatch = dispatch;
		return child;
	}
	
	function select(key){
		var child = createObjectState();
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
		child.dispatch = dispatch;
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

(function($){

var map = $.fn.map;
var slice = Array.prototype.slice;

function createMethod(store, name, type){
	if( typeof type === "function" || !type ){
		return function(){
			return store.select(name, type);
		};
	}
	
	return function(){
		var m = type.length;
		var deps = new Array(m);
		for(var i=0; i<m; ++i){
			var dep = type[i];
			deps[i] = typeof dep === "string" ? store.select(dep) : dep;
		}
		
		var args = arguments;
		var n = args.length;
		var inputs = [].concat(args, deps);
		
		return map.call(inputs, function(){
			var value = store.get();
			return value && value[name].apply(value, slice.call(arguments, 0, n));
		});
	};
}

function createMethods(store, methods, target){
	if(!target){
		target = store;
	}
	
	for(var name in methods){
		if( name in target ){
			throw new Error("Property '" + name + "' already exists");
		}
		
		target[name] = createMethod(store, name, methods[name]);
	}
	
	return target;
}

$.storeMethods = createMethods;

})($);

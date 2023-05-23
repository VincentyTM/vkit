(function($){

var map = $.fn.map;
var slice = Array.prototype.slice;

function createMethod(store, name, dependencies){
	if( typeof dependencies === "function" || !dependencies ){
		return function(){
			return store.select(name, dependencies);
		};
	}
	
	return function(){
		var m = dependencies.length;
		var deps = new Array(m);
		for(var i=0; i<m; ++i){
			var dep = dependencies[i];
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
	if(!target) target = store;
	for(var name in methods){
		var method = methods[name];
		if( name in target ){
			throw new Error("Property '" + name + "' already exists");
		}
		target[name] = createMethod(store, name, method);
	}
	return target;
}

$.storeMethods = createMethods;

})($);

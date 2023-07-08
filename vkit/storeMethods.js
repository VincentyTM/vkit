(function($, undefined){

var map = $.fn.map;
var slice = Array.prototype.slice;
var toString = Object.prototype.toString;

function createMethod(store, name, type){
	if( type === "action" ){
		return function(){
			var self = store.get();
			
			if( self === undefined ){
				throw new Error("Undefined object");
			}
			
			var method = self[name];
			
			if( typeof method === "function" ){
				return method.apply(self, arguments);
			}
		};
	}
	
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
			
			if( typeof dep === "string" ){
				dep = store.select(dep);
			}else if( toString.call(dep) === "[object Array]" ){
				var arr = dep;
				var l = arr.length;
				
				dep = store;
				
				for(var j=0; j<l; ++j){
					dep = dep.select(arr[j]);
				}
			}
			
			deps[i] = dep;
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

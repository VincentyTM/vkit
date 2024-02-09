(function($) {

var computed = $.computed;
var isArray = $.isArray;
var selectProperty = $.selectProperty;

function selectMethod(parent, name, args, dependencies) {
	var signal = computed(function() {
		var value = parent.get();
		
		if (!value) {
			return;
		}
		
		if (typeof value[name] !== "function") {
			throw new TypeError(name + " is not a function");
		}
		
		return value[name].apply(value, arguments);
	}, args);
	
	var m = dependencies.length;
	var deps = new Array(m);
	
	for (var i = 0; i < m; ++i) {
		var dep = dependencies[i];
		
		if (typeof dep === "string") {
			dep = selectProperty(parent, dep);
		} else if (isArray(dep)) {
			var arr = dep;
			var l = arr.length;
			
			dep = parent;
			
			for (var j = 0; j < l; ++j) {
				dep = selectProperty(dep, arr[j]);
			}
		} else {
			throw new Error("Invalid dependency " + dep);
		}
		
		dep.subscribe(signal.update);
	}
	
	return signal;
};

$.selectMethod = selectMethod;

})($);

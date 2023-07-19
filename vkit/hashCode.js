(function($){

var map = typeof WeakMap === "function" ? new WeakMap() : {
	get: function(object){
		return object.__hashCode;
	},
	
	set: function(object, value){
		object.__hashCode = value;
	}
};

var objectCount = 0;

function next(value){
	var key = map.get(value);
	
	if( key ){
		return key;
	}
	
	key = ++objectCount;
	map.set(value, key);
	
	return key;
}

function hashCode(value){
	switch(typeof value){
		case "object":
			return value === null ? String(value) : "o" + next(value);
		case "string":
			return "s" + value;
		case "number":
		case "boolean":
		case "undefined":
		case "symbol":
			return String(value);
		case "function":
			return "f" + next(value);
		case "bigint":
			return value + "n";
	}
}

$.hashCode = hashCode;

})($);

(function($){

var toString = Object.prototype.toString;

function validate(type, data){
	switch( type ){
		case String: return typeof data === "string";
		case Boolean: return typeof data === "boolean";
		case Number: return typeof data === "number" && !isNaN(data) && isFinite(data);
		case null: return data === null;
	}
	if( typeof type === "function" ){
		return type(data);
	}
	if( type instanceof RegExp ){
		return type.test(data);
	}
	if( type instanceof Array ){
		var n = type.length;
		for(var i=0; i<n; ++i){
			if(!validate(type[i], data)){
				return false;
			}
		}
		return true;
	}
	if(!data || typeof data !== "object"){
		return false;
	}
	for(var key in data){
		if(!(key in type)){
			return false;
		}
	}
	for(var key in type){
		if(!(key in data) || !validate(type[key], data[key])){
			return false;
		}
	}
	return true;
}

$.validate = validate;

$.validators = {
	Any: function(){
		return true;
	},
	MinLength: function(a){
		return function(x){
			return x.length >= a;
		};
	},
	MaxLength: function(a){
		return function(x){
			return x.length <= a;
		}
	},
	Min: function(a, b){
		return function(x){
			return x >= a;
		}
	},
	Max: function(a, b){
		return function(x){
			return x <= a;
		};
	},
	Between: function(a, b){
		return function(x){
			return x >= a && x <= b;
		};
	},
	SetOf: function(T){
		return function(x){
			if(!x || typeof x !== "object"){
				return false;
			}
			for(var k in x){
				if(!validate(T, x[k])){
					return false;
				}
			}
			return true;
		};
	},
	ArrayOf: function(T){
		return function(x){
			if( toString.call(x) !== "[object Array]" ){
				return false;
			}
			var n = x.length;
			for(var i=0; i<n; ++i){
				if(!validate(T, x[i])){
					return false;
				}
			}
			return true;
		};
	},
	InstanceOf: function(c){
		return function(x){
			return x instanceof c;
		};
	},
	Enum: function(){
		var values = arguments, n = values.length;
		return function(x){
			for(var i=0; i<n; ++i){
				if( values[i] === x ){
					return true;
				}
			}
			return false;
		};
	},
	Union: function(){
		var types = arguments, n = types.length;
		return function(x){
			for(var i=0; i<n; ++i){
				if( validate(types[i], x) ){
					return true;
				}
			}
			return false;
		};
	},
	Extend: function(A, B){
		var obj = {};
		for(var k in A) obj[k] = A[k];
		for(var k in B) obj[k] = B[k];
		return function(x){
			return validate(obj, x);
		};
	},
	Partial: function(T){
		if(!T || typeof T !== "object" || T instanceof Array || T instanceof RegExp){
			throw new TypeError("Partial types can only be used with non-Array, non-RegExp objects.");
		}
		return function(x){
			for(var k in x){
				if(!(k in T) || !validate(T[k], x[k])){
					return false;
				}
			}
			return true;
		};
	},
	Required: function(T){
		if(!T || typeof T !== "object" || T instanceof Array || T instanceof RegExp){
			throw new TypeError("Required types can only be used with non-Array, non-RegExp objects.");
		}
		return function(x){
			for(var k in T){
				if(!(k in x) || !validate(T[k], x[k])){
					return false;
				}
			}
			return true;
		};
	},
	Recursive: function(getType){
		return function(x){
			return validate(getType(), x);
		};
	},
	Not: function(T){
		return function(x){
			return !validate(T, x);
		};
	},
	Optional: function(T){
		return function(x){
			return x === null || validate(T, x);
		};
	},
	DateTime: function(x){
		return new Date(x).getTime() === x;
	},
	Int: function(x){
		return typeof x === "number" && isFinite(x) && Math.floor(x) === x;
	},
	Natural: function(x){
		return typeof x === "number" && isFinite(x) && Math.floor(x) === x && x >= 0;
	},
	Key: function(x){
		return typeof x === "string" || typeof x === "symbol";
	}
};

})($);

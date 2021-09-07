(function($){

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
			if(!(x instanceof Array)){
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
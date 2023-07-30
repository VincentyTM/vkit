(function($){

var createSignal = $.signal;
var isArray = $.isArray;
var lazyArray = $.lazyArray;
var selectMethod = $.selectMethod;
var selectProperty = $.selectProperty;
var useKey = $.useKey;

var modelToSelector = typeof WeakMap === "function" ? new WeakMap() : null;
var getValueKey = typeof Symbol === "function" ? Symbol() : "__getValue";

function getTyped(signal, type, array, arrayKey, lazy){
	if(!array){
		return type ? type(signal) : signal;
	}
	
	if( lazy ){
		signal = lazyArray(signal);
	}
	
	if( arrayKey ){
		return useKey(signal, arrayKey, type);
	}
	
	if(!type){
		return signal;
	}
	
	return signal.map(function(input){
		var n = input.length;
		var output = new Array(n);
		
		for(var i=0; i<n; ++i){
			output[i] = type(input[i]);
		}
		
		return output;
	});
}

function getArguments(args){
	var n = args.length;
	var newArgs = new Array(n);
	
	for(var i=0; i<n; ++i){
		var arg = args[i];
		newArgs[i] = arg && typeof arg[getValueKey] === "function" ? arg[getValueKey]() : arg;
	}
	
	return newArgs;
}

function createSelectorMethod(signal, key, definition){
	if(!definition){
		definition = {};
	}
	
	if( definition.signal ){
		return function(){
			return signal;
		};
	}
	
	if( typeof definition === "function" ){
		return definition;
	}
	
	if( definition.action ){
		var name = typeof definition.action === "string" ? definition.action : key;
		
		return function(){
			var object = signal.get();
			
			if( object ){
				var func = object[name];
				
				if( typeof func !== "function" ){
					throw new TypeError(name + " is not a function");
				}
				
				var ret = func.apply(object, getArguments(arguments));
				
				if( definition.returnValue ){
					return ret;
				}
			}
		};
	}
	
	var array = definition.array;
	var arrayKey = definition.key;
	var lazy = definition.lazy;
	var type = typeof definition.type === "function" ? definition.type : null;
	
	if( definition.method ){
		var name = typeof definition.method === "string" ? definition.method : key;
		var dependencies = isArray(definition.dependencies) ? definition.dependencies : [];
		
		return function(){
			return getTyped(
				selectMethod(signal, name, getArguments(arguments), dependencies),
				type,
				array,
				arrayKey,
				lazy
			);
		};
	}
	
	var name = typeof definition.property === "string" ? definition.property : key;
	
	return function(){
		return getTyped(
			selectProperty(signal, name),
			type,
			array,
			arrayKey,
			lazy
		);
	};
}

function createSelector(signal, input){
	var model;
	
	if( signal && typeof signal.effect === "function" ){
		if( signal.selector ){
			return signal.selector;
		}
	}else{
		model = signal;
		
		if( modelToSelector ){
			var value = modelToSelector.get(model);
			
			if( value ){
				return value;
			}
		}
		
		signal = createSignal(model);
	}
	
	var output = {};
	
	output[getValueKey] = function(){
		return signal.get();
	};
	
	for(var key in input){
		output[key] = createSelectorMethod(signal, key, input[key]);
	}
	
	signal.selector = output;
	
	if( model && modelToSelector && (typeof model === "object" || typeof model === "function") ){
		modelToSelector.set(model, output);
	}
	
	return output;
}

$.selector = createSelector;

})($);

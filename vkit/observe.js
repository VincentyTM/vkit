(function($, undefined){

function getObservable(obj, prop){
	var desc = Object.getOwnPropertyDescriptor(obj, prop);
	if(!desc){
		return null;
	}
	if( desc.get && desc.get.onChange ){
		return desc.get.onChange;
	}
	var value = obj[prop];
	function get(){
		return value;
	}
	get.onChange = $.observable();
	Object.defineProperty(obj, prop, {
		get: get,
		set: function(v){
			if( value !== v ){
				get.onChange(value = v);
			}
		}
	});
	return get.onChange;
}

$.observe = function(obj, prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return $.observe(obj, prop);
			}
		});
	}
	var observable = getObservable(obj, prop);
	if(!observable){
		throw new ReferenceError("Property " + prop + " does not exist!");
	}
	var state = $.state(obj[prop]);
	var set = state.set;
	state.set = function(value){
		obj[prop] = value;
	};
	$.unmount(observable.subscribe(function(value){
		set.call(state, value);
	}));
	return state;
};

})($);

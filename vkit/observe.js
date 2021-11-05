(function($, undefined){

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
	var observable = $.onChange(obj, prop);
	if(!observable){
		throw new ReferenceError("Property '" + prop + "' does not exist!");
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
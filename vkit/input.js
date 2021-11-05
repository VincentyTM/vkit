(function($, undefined){

$.input = function(obj, prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return $.input(obj, prop);
			}
		});
	}
	var value = obj[prop];
	if( value && typeof value.input === "function" ){
		return value.input();
	}
	return $.observe(obj, prop);
};

})($);

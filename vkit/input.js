(function($, undefined){

var observe = $.observe;

function createInput(obj, prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return createInput(obj, prop);
			}
		});
	}
	var value = obj[prop];
	if( value && typeof value.get === "function" ){
		return value;
	}
	return observe(obj, prop);
}

$.input = createInput;

})($);

(function($){

var input = $.input;
var combine = $.fn.map;

function memo(obj, props, func){
	var n = props.length;
	var states = new Array(n);
	for(var i=0; i<n; ++i){
		var prop = props[i];
		states[i] = typeof prop === "object" ? prop : input(obj, prop);
	}
	return combine.call(states, func);
}

$.memo = memo;

})($);

(function($){

var map = $.fn.map;
var slice = Array.prototype.slice;

function createStateOf(obj){
	return obj && typeof obj.get === "function" ? obj : {
		get: function(){
			return obj;
		}
	};
}

function templateTag(strings){
	var n = strings.length;
	var states = slice.call(arguments, 1);
	for(var i=states.length; i--;){
		states[i] = createStateOf(states[i]);
	}
	return map.call(states, function(){
		var a = new Array(2*n - 1);
		if( n > 0 ){
			a[0] = strings[0];
		}
		for(var i=1, j=1; i<n; ++i){
			a[j++] = arguments[i-1];
			a[j++] = strings[i];
		}
		return a.join("");
	});
}

$.stateString = templateTag;

})($);

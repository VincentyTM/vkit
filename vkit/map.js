(function($){

var combineStates = $.fn.map;

function createConstState(value){
	function get(){
		return value;
	}
	return {get: get};
}

function mapStates(transform){
	function map(){
		var n = arguments.length;
		var a = new Array(n);
		for(var i=0; i<n; ++i){
			var state = arguments[i];
			a[i] = state && typeof state.get === "function" ? state : createConstState(state);
		}
		return combineStates.call(a, transform);
	}
	map.get = transform;
	return map;
}

$.map = mapStates;

})($);

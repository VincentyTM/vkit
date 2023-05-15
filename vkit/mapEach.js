(function($){

function mapEach(){
	var states = this;
	var n = states.length;
	var result = new Array(n);
	for(var i=0; i<n; ++i){
		var state = states[i];
		result[i] = state.map.apply(state, arguments);
	}
	return result;
}

$.fn.mapEach = mapEach;

})($);

(function($){

function mapEach(){
	var states = this;
	var n = states.length;
	var result = $();
	for(var i=0; i<n; ++i){
		var state = states[i];
		result.push(state.map.apply(state, arguments));
	}
	return result;
}

$.fn.mapEach = mapEach;

})($);

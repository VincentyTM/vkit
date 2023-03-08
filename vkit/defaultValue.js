(function($){

function defaultValue(state, value){
	return state.map(function(v){
		return v === null || v === undefined ? value : v;
	});
}

$.defaultValue = defaultValue;

})($);

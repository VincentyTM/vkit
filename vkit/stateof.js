(function($){

$.stateOf = function(get, set){
	var isFunction = typeof get === "function";
	var state = $.state(isFunction ? get() : get[set]);
	state.get = isFunction ? get : function(){
		return get[set];
	};
	var _set = state.set;
	if( set ){
		state.set = function(value){
			if( isFunction ){
				set(value);
			}else{
				get[set] = value;
			}
			_set.call(state, value);
		};
	}else{
		delete state.set;
	}
	$.effect(function(){
		_set.call(state, isFunction ? get() : get[set]);
	});
	return state;
};

})($);

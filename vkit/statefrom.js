(function($){

var effect = $.effect;
var createState = $.state;

function stateFrom(get, set){
	var isFunction = typeof get === "function";
	var state = createState(isFunction ? get() : get[set]);
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
			_set(value);
		};
	}else{
		delete state.set;
	}
	effect(function(){
		_set(isFunction ? get() : get[set]);
	});
	return state;
}

$.stateFrom = stateFrom;

})($);

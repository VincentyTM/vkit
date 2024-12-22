(function($){

var signal = $.signal;

function sync(state1, encode, decode, state2){
	var value = encode(state1.get());
	if( state2 ){
		state2.set(value);
	}else{
		state2 = signal(value);
	}
	var set1 = state1.set;
	var set2 = state2.set;
	state1.set = function(value){
		set1(value);
		set2(encode(value));
	};
	state2.set = function(value){
		if( decode ){
			value = decode(value);
		}
		set1(value);
		set2(encode(value));
	};
	return state2;
}

$.sync = sync;

})($);

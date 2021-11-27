(function($){

var unmount = $.unmount;
var onEvent = $.onEvent;
var createState = $.state;

function createHashState(){
	var state = createState(decodeURIComponent(location.hash.substring(1)));
	unmount(
		state.onChange.subscribe(function(value){
			location.replace("#" + encodeURIComponent(value));
		})
	);
	unmount(
		onEvent(window, "hashchange", function(){
			state.set(decodeURIComponent(location.hash.substring(1)));
		})
	);
	state.push = function(value){
		location.assign("#" + encodeURIComponent(value));
	};
	return state;
}

$.hashState = createHashState;

})($);

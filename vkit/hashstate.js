(function($, window){

var unmount = $.unmount;
var onEvent = $.onEvent;
var createState = $.state;

function createHashState(win){
	if(!win) win = window;
	var location = win.location;
	var state = createState(decodeURIComponent(location.hash.substring(1)));
	state.onChange.subscribe(function(value){
		location.replace("#" + encodeURIComponent(value));
	});
	unmount(
		onEvent(win, "hashchange", function(){
			state.set(decodeURIComponent(location.hash.substring(1)));
		})
	);
	state.push = function(value){
		location.assign("#" + encodeURIComponent(value));
	};
	return state;
}

$.hashState = createHashState;

})($, window);

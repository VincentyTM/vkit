(function($){

var createHistoryHandler = $.history;
var createState = $.state;
var getWindow = $.window;
var onEvent = $.onEvent;
var unmount = $.unmount;

function getHash(url){
	var pos = url.indexOf("#");
	return pos === -1 ? "" : url.substring(pos + 1);
}

function createHashState(win){
	if(!win) win = getWindow();
	var location = win.location;
	var state = createState(decodeURIComponent(location.hash.substring(1)));
	var history = createHistoryHandler(win);
	
	history.url().map(getHash).pipe(state);
	
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
	
	state.replace = function(value){
		history.replace("#" + value);
	};
	
	return state;
}

$.hashState = createHashState;

})($);

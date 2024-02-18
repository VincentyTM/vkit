(function($){

var createHistoryHandler = $.history;
var createSignal = $.signal;
var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function getHash(url){
	var pos = url.indexOf("#");
	return pos === -1 ? "" : url.substring(pos + 1);
}

function createHashSignal(win){
	if(!win){
		win = getWindow();
	}
	
	var location = win.location;
	var signal = createSignal(decodeURIComponent(location.hash.substring(1)));
	var history = createHistoryHandler(win);
	
	history.url().map(getHash).pipe(signal);
	
	signal.subscribe(function(value){
		location.replace("#" + encodeURIComponent(value));
	});
	
	onUnmount(
		onEvent(win, "hashchange", function() {
			hash.set(decodeURIComponent(location.hash.substring(1)));
		})
	);
	
	signal.push = function(value){
		location.assign("#" + encodeURIComponent(value));
	};
	
	signal.replace = function(value){
		history.replace("#" + value);
	};
	
	return signal;
}

$.hash = createHashSignal;

})($);

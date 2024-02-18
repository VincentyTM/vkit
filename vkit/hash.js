(function($) {

var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var signal = $.signal;
var useHistory = $.history;

function getHash(url) {
	var pos = url.indexOf("#");
	return pos === -1 ? "" : url.substring(pos + 1);
}

function createHashSignal() {
	var win = getWindow();
	var location = win.location;
	var hash = signal(decodeURIComponent(location.hash.substring(1)));
	var history = useHistory(win);
	
	history.url().map(getHash).pipe(hash);
	
	hash.subscribe(function(value) {
		location.replace("#" + encodeURIComponent(value));
	});
	
	onUnmount(
		onEvent(win, "hashchange", function() {
			hash.set(decodeURIComponent(location.hash.substring(1)));
		})
	);
	
	hash.push = function(value) {
		location.assign("#" + encodeURIComponent(value));
	};
	
	hash.replace = function(value) {
		history.replace("#" + value);
	};
	
	return hash;
}

$.hash = createHashSignal;

})($);

(function($) {

var computed = $.computed;
var getWindow = $.getWindow;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var useHistory = $.history;

function getHash(url) {
	var pos = url.indexOf("#");
	return pos === -1 ? "" : url.substring(pos + 1);
}

function createHashSignal() {
	var win = getWindow();
	var location = win.location;
	var history = useHistory(win);
	
	var hash = computed(function() {
		return decodeURIComponent(location.hash.substring(1));
	});
	
	history.url().effect(function() {
		hash.invalidate();
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

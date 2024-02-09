(function($, undefined) {

var computed = $.computed;
var getWindow = $.window;
var observable = $.observable;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

var updateHistory = observable();

function getURL(win) {
	return win.location.href.replace(win.location.origin, "");
}

function createHistoryHandler(win) {
	if (!win) {
		win = getWindow();
	}
	
	var history = win.history;
	
	function push(url, state) {
		history.pushState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		updateHistory(history);
	}
	
	function replace(url, state) {
		history.replaceState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		updateHistory(history);
	}
	
	function selectState() {
		var historyState = computed(function() {
			return history.state;
		});
		var invalidate = historyState.invalidate;
		
		onUnmount(onEvent(win, "popstate", invalidate));
		onUnmount(updateHistory.subscribe(updateLocal));
		
		function updateLocal(h) {
			if (h === history) {
				invalidate();
			}
		}
		
		return historyState;
	}
	
	function selectURL() {
		var historyURL = computed(function() {
			return getURL(win);
		});
		var invalidate = historyURL.invalidate;
		
		onUnmount(onEvent(win, "popstate", invalidate));
		onUnmount(updateHistory.subscribe(updateLocal));
		
		function updateLocal(h) {
			if (h === history) {
				invalidate();
			}
		}
		
		return historyURL;
	}
	
	return {
		push: push,
		replace: replace,
		state: selectState,
		url: selectURL
	};
}

$.history = createHistoryHandler;

})($);

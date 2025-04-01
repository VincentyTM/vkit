(function($) {

var isSignal = $.isSignal;
var observable = $.observable;

var emitNavigate = observable();

function navigate(win, url) {
	var currentURL = isSignal(url) ? url.get() : url;
	
	if (emitNavigate.count() > 0) {
		var prevented = false;
		
		emitNavigate({
			url: currentURL,
			window: win,
			prevent: function() {
				prevented = true;
			}
		});
		
		if (prevented) {
			return;
		}
	}
	
	var history = win.history;

	if (!history.pushState || typeof PopStateEvent !== "function") {
		win.location.assign(currentURL);
		return;
	}

	history.pushState(null, "", currentURL);

	var event = new PopStateEvent("popstate", {state: null});
	win.dispatchEvent(event);
	win.scrollTo(0, 0);
}

$.navigate = navigate;
$.onNavigate = emitNavigate.subscribe;

})($);

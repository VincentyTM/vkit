(function($, window) {

var history = $.history;
var observable = $.observable;

var emitNavigate = observable();

function navigate(url, win, noScroll) {
	if (!win) {
		win = window;
	}
	
	if (typeof url.get === "function") {
		url = url.get();
	}
	
	if (emitNavigate.count() > 0) {
		var prevented = false;
		
		emitNavigate({
			url: url,
			window: win,
			prevent: function() {
				prevented = true;
			}
		});
		
		if (prevented) {
			return;
		}
	}
	
	history(win).push(url);
	
	if (!noScroll) {
		win.scrollTo(0, 0);
	}
}

$.navigate = navigate;
$.onNavigate = emitNavigate.subscribe;

})($, window);

(function($, window) {

var getWindow = $.window;
var history = $.history;
var observable = $.observable;

var emitNavigate = observable();

function createHref(url, win) {
	if (!win) {
		win = getWindow();
	}
	
	return {
		href: url,
		onclick: function(e) {
			e.preventDefault();
			navigate(url, win);
		}
	};
}

function navigate(url, win) {
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
	win.scrollTo(0, 0);
}

$.href = createHref;
$.navigate = navigate;
$.onNavigate = emitNavigate.subscribe;

})($, window);

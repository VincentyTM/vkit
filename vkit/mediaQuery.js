(function($) {

var computed = $.computed;
var getWindow = $.getWindow;
var onUnmount = $.onUnmount;
var signal = $.signal;
var update = $.update;

function createMediaQuery(mediaQuery, win) {
	if (!win) {
		win = getWindow();
	}
	
	if (!win.matchMedia) {
		return computed(function() {
			return false;
		});
	}
	
	var matcher = win.matchMedia(mediaQuery);
	var matches = signal(matcher.matches);
	
	function handleChange(e) {
		matches.set(e.matches);
		update();
	}
	
	if (matcher.addEventListener) {
		matcher.addEventListener("change", handleChange);
		
		onUnmount(function() {
			matcher.removeEventListener("change", handleChange);
		});
	} else {
		matcher.addListener(handleChange);
		
		onUnmount(function() {
			matcher.removeListener(handleChange);
		});
	}
	
	return matches.map();
}

$.mediaQuery = createMediaQuery;

})($);

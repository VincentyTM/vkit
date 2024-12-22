(function($) {

var computed = $.computed;
var getWindow = $.getWindow;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function mediaQuery(query) {
	var win = getWindow();
	
	if (!win.matchMedia) {
		return computed(function() {
			return false;
		});
	}
	
	var matcher = win.matchMedia(query);
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
	
	return readOnly(matches);
}

$.mediaQuery = mediaQuery;

})($);

(function($){

var computed = $.computed;
var getWindow = $.window;
var onUnmount = $.onUnmount;

function createMediaQuery(mediaQuery, win) {
	if (!win) {
		win = getWindow();
	}
	
	var matches = false;
	
	var result = computed(function() {
		return matches;
	});
	
	if (!win.matchMedia) {
		return result;
	}
	
	var updateResult = result.update;
	var matcher = win.matchMedia(mediaQuery);
	
	matches = matcher.matches;
	
	function handleChange(e) {
		matches = e.matches;
		updateResult();
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
	
	return result;
}

$.mediaQuery = createMediaQuery;

})($);

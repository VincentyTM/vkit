(function($) {

var computed = $.computed;
var getWindow = $.getWindow;
var isSignal = $.isSignal;
var navigate = $.navigate;

function createHref(url, win, noScroll) {
	if (!win) {
		win = getWindow();
	}
	
	if (typeof url === "function" && !isSignal(url)) {
		url = computed(url);
	}
	
	return {
		href: url,
		onclick: function(e) {
			e.preventDefault();
			navigate(url, win, noScroll);
		}
	};
}

$.href = createHref;

})($);

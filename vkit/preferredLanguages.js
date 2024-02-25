(function($) {

var computed = $.computed;
var getWindow = $.getWindow;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function getPreferredLanguages(nav) {
	return nav.languages || [
		nav.language ||
		nav.browserLanguage ||
		nav.systemLanguage ||
		nav.userLanguage
	];
}

function preferredLanguages() {
	var win = getWindow();
	var nav = win.navigator;
	
	var langs = computed(function() {
		return getPreferredLanguages(nav);
	});
	
	onUnmount(
		onEvent(win, "languagechange", langs.invalidate)
	);
	
	return langs;
}

$.preferredLanguages = preferredLanguages;

})($);

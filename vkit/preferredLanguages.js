(function($, window){

var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;

function getPreferredLanguages(nav){
	return nav.languages || [
		nav.language ||
		nav.browserLanguage ||
		nav.systemLanguage ||
		nav.userLanguage
	];
}

function preferredLanguages(win){
	if(!win) win = window;
	var nav = win.navigator;
	var langs = createState(getPreferredLanguages(nav));
	
	unmount(
		onEvent(win, "languagechange", function(){
			langs.set(getPreferredLanguages(nav));
		})
	);
	
	return langs.map();
}

$.preferredLanguages = preferredLanguages;

})($, window);

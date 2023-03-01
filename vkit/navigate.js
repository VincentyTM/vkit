(function($, window){

var createHistoryHandler = $.history;
var unsavedGuard = $.unsavedGuard;
var navigationGuard = function(){ return false; };

function canNavigate(guard){
	if( typeof guard === "function" ){
		navigationGuard = guard;
	}
}

function createHref(url, win){
	return {
		href: url,
		onclick: function(e){
			e.preventDefault();
			navigate(url, win);
		}
	};
}

function navigate(url, win){
	if(!win) win = window;
	if( unsavedGuard.count > 0 && !navigationGuard(url, win) ){
		return;
	}
	createHistoryHandler(win).push(typeof url.get === "function" ? url.get() : url);
	win.scrollTo(0, 0);
}

$.href = createHref;
$.navigate = navigate;
$.canNavigate = canNavigate;

})($, window);

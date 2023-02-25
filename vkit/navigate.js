(function($, window){

var unsavedGuard = $.unsavedGuard;
var navigationGuard = function(){ return false; };

function canNavigate(guard){
	if( typeof guard === "function" ){
		navigationGuard = guard;
	}
}

function createHref(url){
	return {
		href: url,
		onclick: function(e){
			e.preventDefault();
			navigate(url);
		}
	};
}

function navigate(url, win){
	if( unsavedGuard.count > 0 && !navigationGuard(url, win) ){
		return;
	}
	if(!win) win = window;
	var history = win.history;
	history.pushState(null, "", typeof url.get === "function" ? url.get() : url);
	if( history.onStateUpdate ){
		history.onStateUpdate();
	}
	win.scrollTo(0, 0);
}

$.href = createHref;
$.navigate = navigate;
$.canNavigate = canNavigate;

})($, window);

(function($, window) {

var createHistoryHandler = $.history;
var createObservable = $.observable;
var emitNavigate = createObservable();
var getWindow = $.window;

function createHref(url, win) {
	if (!win) {
		win = getWindow();
	}
	
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
	
	if( typeof url.get === "function" ){
		url = url.get();
	}
	
	if( emitNavigate.count() > 0 ){
		var prevented = false;
		
		emitNavigate({
			url: url,
			window: win,
			prevent: function(){
				prevented = true;
			}
		});
		
		if( prevented ){
			return;
		}
	}
	
	createHistoryHandler(win).push(url);
	win.scrollTo(0, 0);
}

$.href = createHref;
$.navigate = navigate;
$.onNavigate = emitNavigate.subscribe;

})($, window);

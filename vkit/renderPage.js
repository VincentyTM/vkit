(function($, window){

var append = $.append;
var bind = $.bind;
var createHistoryHandler = $.history;
var inject = $.inject;
var provide = $.provide;
var render = $.render;
var renderDetached = $.renderDetached;
var StyleService = $.styleService;
var WindowService = $.windowService;

function renderPage(root, url, callback, tagName, win){
	if(!win) win = window;
	var history = createHistoryHandler(win);
	var prevURL = win.location.href;
	var state = history.state;
	
	renderDetached(function(unmount){
		try{
			history.replace(url);
			var container = win.document.createElement(tagName || "body");
			provide([StyleService, WindowService], function(){
				inject(WindowService).window = win;
				append(container, [root(), StyleService().element], container, bind);
			});
			render();
			callback(container);
			unmount();
		}finally{
			history.replace(prevURL);
			render();
		}
		return container;
	});
}

$.renderPage = renderPage;

})($, window);

(function($, window){

var append = $.append;
var bind = $.bind;
var getStyleService = $.styleService;
var createHistoryHandler = $.history;
var provide = $.provide;
var render = $.render;
var renderDetached = $.renderDetached;

function renderPage(root, url, callback, tagName, win){
	if(!win) win = window;
	var history = createHistoryHandler(win);
	var prevURL = win.location.href;
	var state = history.state;
	
	renderDetached(function(unmount, component){
		try{
			component.window = win;
			history.replace(url);
			var container = win.document.createElement(tagName || "body");
			provide([getStyleService], function(){
				append(container, [root(), getStyleService().element], container, bind);
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

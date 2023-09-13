(function($, window){

var append = $.append;
var bind = $.bind;
var createHistoryHandler = $.history;
var inject = $.inject;
var renderDetached = $.renderDetached;
var update = $.update;
var WindowService = $.windowService;

function renderPage(root, url, callback, tagName, win){
	if(!win){
		win = window;
	}
	
	var history = createHistoryHandler(win);
	var prevURL = win.location.href;
	var state = history.state;
	
	renderDetached(function(unmount){
		try{
			history.replace(url);
			
			var container = win.document.createElement(tagName || "body");
			
			inject(WindowService).window = win;
			
			append(
				container,
				root(),
				container,
				bind
			);
			
			update();
			callback(container);
			unmount();
		}finally{
			history.replace(prevURL);
			update();
		}
		
		return container;
	});
}

$.renderPage = renderPage;

})($, window);

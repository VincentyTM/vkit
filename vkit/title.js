(function($){

var createWindowData = $.windowData;

function init(win, callback){
	var document = win.document;
	
	callback(document.title, function(title){
		document.title = title;
	});
}

$.title = createWindowData("title", init);

})($);

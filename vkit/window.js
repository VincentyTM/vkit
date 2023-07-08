(function($, window){

var bind = $.bind;
var inject = $.inject;
var withContext = $.withContext;

function WindowService(){
	this.window = window;
	this.run = withContext(function(callback){
		return callback();
	});
}

function getWindow(){
	var win = inject(WindowService).window;
	var n = arguments.length;
	for(var i=0; i<n; ++i){
		bind(win, arguments[i]);
	}
	return win;
}

$.window = getWindow;
$.windowService = WindowService;

})($, window);

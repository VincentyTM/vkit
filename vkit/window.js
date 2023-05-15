(function($, window){

var bind = $.bind;
var inject = $.inject;

function WindowService(){
	this.window = window;
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

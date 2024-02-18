(function($, window){

var bind = $.bind;
var getContext = $.context;
var inject = $.inject;

function WindowService(){
	this.context = getContext();
	this.data = null;
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

$.getWindow = getWindow;
$.window = getWindow;
$.windowService = WindowService;

})($, window);

(function($, window){

var bind = $.bind;
var getComponent = $.getComponent;
var getProvider = $.getProvider;
var getContext = $.context;
var inject = $.inject;

function WindowService(){
	this.component = getComponent();
	this.provider = getProvider();
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

$.window = getWindow;
$.windowService = WindowService;

})($, window);

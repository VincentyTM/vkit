(function($){

var onEvent = $.onEvent;
var renderDetached = $.renderDetached;

function windowContent(component){
	return function(win, props){
		renderDetached(function(unmount){
			onEvent(win, "unload", unmount);
			return component(win, props);
		}, win.document.body);
	};
}

$.windowContent = windowContent;

})($);

(function($){

var onEvent = $.onEvent;
var renderDetached = $.renderDetached;

function createWindowContent(component){
	return function(win){
		renderDetached(function(unmount){
			onEvent(win, "unload", unmount);
			return component(win);
		}, win.document.body);
	};
}

$.windowContent = createWindowContent;

})($);

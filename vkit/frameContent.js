(function($){

var onEvent = $.onEvent;
var renderDetached = $.renderDetached;

function createFrameContent(component){
	return [
		{
			onload: function(){
				var win = this.contentWindow;
				renderDetached(function(unmount){
					onEvent(win, "unload", unmount);
					return (typeof component.get === "function" ? component.get() : component)();
				}, win.document.body);
			}
		},
		typeof component.subscribe === "function" ? function(iframe){
			component.subscribe(function(){
				iframe.src = "";
			});
		} : null
	];
}

$.frameContent = createFrameContent;

})($);

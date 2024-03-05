(function($) {

var onEvent = $.onEvent;
var renderDetached = $.renderDetached;

function frameContent(getView) {
	var props = {
		onload: function() {
			var win = this.contentWindow;
			
			renderDetached(function(unmount) {
				onEvent(win, "unload", unmount);
				
				return (
					typeof getView.get === "function" ? getView.get() : getView
				)();
			}, win.document.body);
		}
	};
	
	if (typeof getView.subscribe !== "function") {
		return props;
	}
	
	return [
		props,
		
		function(iframe) {
			getView.subscribe(function() {
				iframe.src = "";
			});
		}
	];
}

$.frameContent = frameContent;

})($);

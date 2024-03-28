(function($) {

var enqueueUpdate = $.enqueueUpdate;
var getComponent = $.getComponent;

function deferRendering() {
	var component = getComponent();
	
	if (component.deferred) {
		return;
	}
	
	var enqueued = false;
	var render = component.render;
	component.render = update;
	component.deferred = true;
	
	function update() {
		if (!enqueued) {
			enqueued = true;
			enqueueUpdate(notify);
		}
	}
	
	function notify() {
		enqueued = false;
		render();
	}
}

$.deferRendering = deferRendering;

})($);

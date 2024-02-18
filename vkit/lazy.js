(function($) {

var onUnmount = $.onUnmount;
var script = $.script;
var signal = $.signal;
var update = $.update;

function call(component) {
	return typeof component === "function" ? component() : component;
}

function emptyComponent() {
	return null;
}

function lazyComponent(promise, pendingComponent, errorComponent) {
	if (!errorComponent) {
		errorComponent = emptyComponent;
	}
	
	var component = signal(pendingComponent || emptyComponent);
	
	function onLoad(successComponent) {
		component.set(successComponent);
		update();
	}
	
	function onError(ex) {
		component.set(function() {
			return errorComponent(ex);
		});
		update();
	}
	
	if (typeof promise === "function") {
		var timeout = setTimeout(function() {
			onLoad(promise);
		}, 0);
		
		onUnmount(function() {
			clearTimeout(timeout);
		});
	} else {
		(promise && typeof promise.then === "function" ? promise : script(promise)).then(onLoad, onError);
	}
	
	return component.view(call);
}

$.lazy = lazyComponent;

})($);

(function($) {

var computed = $.computed;
var getWindow = $.window;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;

function visibilityState() {
	var doc = getWindow().document;
	
	var visibility = computed(function() {
		return doc.visibilityState === "visible" || !doc.visibilityState;
	});
	
	onUnmount(
		onEvent(doc, "visibilitychange", visibility.invalidate)
	);
	
	return visibility;
}

$.visibilityState = visibilityState;

})($);

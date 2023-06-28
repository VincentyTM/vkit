(function($){

var createState = $.state;
var getWindow = $.window;
var onEvent = $.onEvent;
var unmount = $.unmount;

function createVisibilityState(doc){
	if(!doc){
		doc = getWindow().document;
	}
	
	function onChange(){
		visibility.set(doc.visibilityState === "visible");
	}
	
	var visibility = createState(
		doc.visibilityState === "visible" || !doc.visibilityState
	);
	
	unmount(
		onEvent(doc, "visibilitychange", onChange)
	);
	
	return visibility;
}

$.visibilityState = createVisibilityState;

})($);

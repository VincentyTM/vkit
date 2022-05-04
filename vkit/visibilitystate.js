(function($, document){

var createState = $.state;
var unmount = $.unmount;
var onEvent = $.onEvent;

function createVisibilityState(doc){
	if(!doc){
		doc = document;
	}
	function onChange(){
		visibility.set(doc.visibilityState === "visible");
	}
	var visibility = createState(doc.visibilityState === "visible" || !doc.visibilityState);
	unmount( onEvent(doc, "visibilitychange", onChange) );
	return visibility;
}

$.visibilityState = createVisibilityState;

})($, document);

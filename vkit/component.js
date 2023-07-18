(function($, document){

var createNodeRange = $.nodeRange;
var createObservable = $.observable;

function createComponent(parent){
	var range = createNodeRange();
	
	return {
		index: 0,
		parent: parent,
		range: range,
		emitError: null,
		unmount: null
	};
}

$.component = createComponent;

})($, document);

(function($, document){

var createNodeRange = $.nodeRange;
var createObservable = $.observable;
var emitUnmount = $.emitUnmount;
var insert = $.insert;
var remove = $.remove;

function createComponent(parent){
	var range = createNodeRange();
	
	return {
		index: 0,
		parent: parent,
		range: range,
		emitError: null,
		unmount: null,
		
		insertView: function(view, anchor){
			insert([range.start, view, range.end], anchor, anchor.parentNode);
		},
		
		appendView: function(view){
			insert(view, range.end, range.end.parentNode);
		}
	};
}

$.component = createComponent;

})($, document);

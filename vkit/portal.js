(function($){

var append = $.append;
var createNodeRange = $.nodeRange;
var unmount = $.unmount;

function createPortal(children, parent){
	var range = createNodeRange();
	append(parent, [range.start, children, range.end]);
	unmount(range.remove);
}

$.portal = createPortal;

})($);

(function($){

var append = $.append;
var createNodeRange = $.nodeRange;
var unmount = $.unmount;

function createPortal(children, parent){
	function remove(){
		range.remove();
	}
	var range = createNodeRange();
	append(parent, [range.start, children, range.end]);
	unmount(remove);
}

$.portal = createPortal;

})($);

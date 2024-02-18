(function($) {

var append = $.append;
var nodeRange = $.nodeRange;
var onUnmount = $.onUnmount;

function portal(children, parent) {
	var range = nodeRange();
	
	append(parent, [
		range.start,
		children,
		range.end
	]);
	
	onUnmount(range.remove);
}

$.portal = portal;

})($);

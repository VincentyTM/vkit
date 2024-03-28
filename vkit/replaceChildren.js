(function($) {

var append = $.append;
var deepPush = $.deepPush;
var empty = $.empty;

function replaceChildren(parent, children, context, bind, crossView) {
	if (parent.replaceChildren) {
		var array = [];
		deepPush(array, children, context, bind, crossView);
		parent.replaceChildren.apply(parent, array);
	} else {
		empty(parent);
		append(parent, children, context, bind, crossView);
	}
}

$.replaceChildren = replaceChildren;

})($);

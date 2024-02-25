(function($) {

var deepPush = $.deepPush;

function append(parent, children, context, bind, crossView) {
	function push(node) {
		parent.appendChild(node);
	}
	
	if (parent.append) {
		var array = [];
		deepPush(array, children, context, bind, crossView);
		parent.append.apply(parent, array);
	} else {
		deepPush({push: push}, children, context, bind, crossView);
	}
}

$.append = append;

})($);

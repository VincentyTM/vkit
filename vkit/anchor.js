(function($, document) {

var nodeRange = $.nodeRange;
var signal = $.signal;

function anchor(view) {
	var currentAnchor = signal(document.createTextNode(""));
	var range = nodeRange();
	
	currentAnchor.subscribe(function(anchor) {
		range.insertBefore(anchor);
	});
	
	function bind(el) {
		currentAnchor.set(el);
	}
	
	function create() {
		var anchor = document.createTextNode("");
		currentAnchor.set(anchor);
		return anchor;
	}
	
	function render() {
		return [range.start, view, range.end, currentAnchor.get()];
	}
	
	currentAnchor.bind = bind;
	currentAnchor.create = create;
	currentAnchor.render = render;
	
	return currentAnchor;
}

$.anchor = anchor;

})($, document);

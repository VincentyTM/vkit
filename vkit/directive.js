(function($, document, undefined) {

var effect = $.effect;

function directive(element, callback) {
	var node, text;
	
	effect(function() {
		if (node) {
			node.nodeValue = callback(element);
		} else {
			text = callback(element);
		}
	});
	
	if (text === undefined) {
		return null;
	}
	
	node = document.createTextNode(text);
	text = undefined;
	return node;
}

$.directive = directive;

})($, document);

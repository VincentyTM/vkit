(function($, document) {

var append = $.append;
var bind = $.bind;

function htmlTag(tagName) {
	return function() {
		var el = document.createElement(tagName);
		append(el, arguments, el, bind);
		return el;
	};
}

$.htmlTag = htmlTag;

})($, document);

(function($, document) {

var append = $.append;
var bind = $.bind;

function renderElement() {
	var el = document.createElement(this.nodeName);
	append(el, this.arguments, el, bind);
	return el;
}

function virtualHtmlTag(tagName) {
	return function() {
		return {
			arguments: arguments,
			isVirtual: true,
			nodeName: tagName.toUpperCase(),
			render: renderElement
		};
	};
}

$.virtualHtmlTag = virtualHtmlTag;

})($, document);

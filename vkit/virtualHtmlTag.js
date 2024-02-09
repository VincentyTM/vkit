(function($) {

var htmlTag = $.htmlTag;

function renderThis() {
	return htmlTag(this.nodeName)(this.arguments);
}

function virtualHtmlTag(nodeName) {
	return function() {
		return {
			arguments: arguments,
			isVirtual: true,
			nodeName: nodeName.toUpperCase(),
			render: renderThis
		};
	};
}

$.virtualHtmlTag = virtualHtmlTag;

})($);

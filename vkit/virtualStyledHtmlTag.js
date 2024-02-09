(function($) {

var htmlTag = $.virtualHtmlTag;
var createStyle = $.style;

function virtualStyledHtmlTag(tagName, css, attr, baseProps) {
	var tag = htmlTag(tagName);
	var style = createStyle(css, attr);
	
	function Component() {
		return tag(style, baseProps, arguments);
	}
	
	return Component;
}

$.virtualStyledHtmlTag = virtualStyledHtmlTag;

})($);

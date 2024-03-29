(function($){

var createHtmlTag = $.htmlTag;
var createStyle = $.style;

function createStyledHtmlTag(tagName, css, attr, baseProps){
	var tag = createHtmlTag(tagName);
	var style = createStyle(css, attr);
	
	function Component(){
		return tag(style, baseProps, arguments);
	}
	
	return Component;
}

$.styledHtmlTag = createStyledHtmlTag;

})($);

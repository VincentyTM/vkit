var htmlTag = require("./htmlTag.js");
var createStyle = require("./style.js");

function styledHtmlTag(tagName, css, attr, baseProps){
	var tag = htmlTag(tagName);
	var style = createStyle(css, attr);
	
	function Component(){
		return tag(style, baseProps, arguments);
	}
	
	return Component;
}

module.exports = styledHtmlTag;

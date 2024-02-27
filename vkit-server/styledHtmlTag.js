import htmlTag from "./htmlTag.js";
import createStyle from "./style.js";

export default function styledHtmlTag(tagName, css, attr, baseProps) {
	var tag = htmlTag(tagName);
	var style = createStyle(css, attr);
	
	function Component() {
		return tag(style, baseProps, arguments);
	}
	
	return Component;
}

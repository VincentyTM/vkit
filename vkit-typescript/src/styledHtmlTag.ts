import { HTMLElementTemplate, htmlTag } from "./htmlTag.js";
import { style } from "./style.js";
import { Template } from "./Template.js";

export function styledHtmlTag<N extends keyof HTMLElementTagNameMap>(
	tagName: N,
	css: string,
	baseProps?: Template<HTMLElementTagNameMap[N]>
): (...contents: Template<HTMLElementTagNameMap[N]>[]) => HTMLElementTemplate<N> {
	var tag = htmlTag(tagName);
	var elementStyle = style(css);
	
	function Component(): HTMLElementTemplate<N> {
		return tag(elementStyle, baseProps, arguments);
	}
	
	return Component;
}

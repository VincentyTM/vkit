import { append } from "./append.js";
import { bind } from "./bind.js";
import { deepPush, Pushable } from "./deepPush.js";
import { HTMLElementTemplate } from "./htmlTag.js";

export function clientRenderHTMLElement<N extends keyof HTMLElementTagNameMap>(
	array: Pushable<HTMLElementTagNameMap[N]>,
	template: HTMLElementTemplate<N>,
	context: unknown,
	crossView: boolean
): void {
	var element = document.createElement(template.tagName);
	append(element, template.child, element, bind, crossView);
	deepPush(array, element, context, bind, crossView);
}

import { append } from "./append.js";
import { bind } from "./bind.js";
import { ClientRenderer, deepPush } from "./deepPush.js";
import { HTMLElementTemplate } from "./htmlTag.js";

export function clientRenderHTMLElement<N extends keyof HTMLElementTagNameMap>(
	clientRenderer: ClientRenderer<unknown>,
	template: HTMLElementTemplate<N>
): void {
	var element = document.createElement(template.tagName);
	append(element, template.child, element, bind, clientRenderer.crossView);
	deepPush(clientRenderer, element);
}

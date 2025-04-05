import { ClientRenderer, deepPush } from "./deepPush.js";
import { HTMLElementTemplate } from "./htmlTag.js";
import { hydrate, HydrationPointer } from "./hydrate.js";

export function clientRenderHTMLElement<N extends keyof HTMLElementTagNameMap>(
	clientRenderer: ClientRenderer<unknown>,
	template: HTMLElementTemplate<N>
): void {
	var element = document.createElement(template.tagName);

	var pointer: HydrationPointer<HTMLElementTagNameMap[N]> = {
		context: element,
		currentNode: null,
		parentEffect: clientRenderer.parentEffect,
		stopNode: null
	};

	hydrate(pointer, template.child);
	deepPush(clientRenderer, element);
}

import { HTMLElementTemplate } from "./htmlTag.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { removeRemainingNodes } from "./removeRemainingNodes.js";

export function hydrateHTMLElement<N extends keyof HTMLElementTagNameMap>(pointer: HydrationPointer<ParentNode>, template: HTMLElementTemplate<N>): void {
	var current = pointer.currentNode;
	var tagName = template.tagName;
	
	if (current && current.nodeName === tagName.toUpperCase() && current !== pointer.stopNode) {
		var childPointer: HydrationPointer<HTMLElementTagNameMap[N]> = {
			context: current as HTMLElementTagNameMap[N],
			currentNode: current.firstChild,
			parentEffect: pointer.parentEffect,
			stopNode: null
		};

		hydrate(childPointer, template.child);
		removeRemainingNodes(childPointer);
		pointer.currentNode = current.nextSibling;
	} else {
		var el = document.createElement(tagName);

		hydrate({
			context: el,
			currentNode: null,
			parentEffect: pointer.parentEffect,
			stopNode: null
		}, template.child);
		
		pointer.context.insertBefore(el, current);
	}
}

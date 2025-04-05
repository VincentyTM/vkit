import { hydrate, HydrationPointer } from "./hydrate.js";
import { removeRemainingNodes } from "./removeRemainingNodes.js";
import { SVGElementTemplate } from "./svgTag.js";

export function hydrateSVGElement<N extends keyof SVGElementTagNameMap>(pointer: HydrationPointer<ParentNode>, template: SVGElementTemplate<N>): void {
	var current = pointer.currentNode;
	var tagName = template.tagName;
	
	if (current && current.nodeName === tagName.toUpperCase() && current !== pointer.stopNode) {
		var childPointer: HydrationPointer<SVGElementTagNameMap[N]> = {
			context: current as SVGElementTagNameMap[N],
			currentNode: current.firstChild,
			parentEffect: pointer.parentEffect,
			stopNode: null
		};

		hydrate(childPointer, template.child);
		removeRemainingNodes(childPointer);
		pointer.currentNode = current.nextSibling;
	} else {
		var el = document.createElementNS("http://www.w3.org/2000/svg", tagName);

		hydrate({
			context: el,
			currentNode: null, 
			parentEffect: pointer.parentEffect,
			stopNode: null
		}, template.child);

		pointer.context.insertBefore(el, current);
	}
}

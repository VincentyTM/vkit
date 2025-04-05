import { ClientRenderer, deepPush } from "./deepPush.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { SVGElementTemplate } from "./svgTag.js";

var xmlns = "http://www.w3.org/2000/svg";

export function clientRenderSVGElement<N extends keyof SVGElementTagNameMap>(
	clientRenderer: ClientRenderer<unknown>,
	template: SVGElementTemplate<N>
): void {
	var element = document.createElementNS(xmlns, template.tagName) as SVGElementTagNameMap[N];
	
	var pointer: HydrationPointer<SVGElementTagNameMap[N]> = {
		context: element,
		currentNode: null,
		parentEffect: clientRenderer.parentEffect,
		stopNode: null
	};

	hydrate(pointer, template.child);
	deepPush(clientRenderer, element);
}

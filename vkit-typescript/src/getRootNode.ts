import { getEffect } from "./contextGuard.js";
import { HTMLElementTemplate } from "./htmlTag.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { SVGElementTemplate } from "./svgTag.js";
import { Template } from "./Template.js";

/**
 * Renders a template and returns its root node.
 * This method can be used to test a component.
 * If there are no nodes rendered, it throws an error.
 * If there are multiple nodes rendered, the first one is returned.
 * @example
 * const div = getRootNode(Div("Hello world"));
 * 
 * console.assert(div.innerText === "Hello world");
 * @param template The template to be rendered.
 * @returns The root node of the rendered DOM subtree.
 */
export function getRootNode<T extends Template>(template: T):
	T extends HTMLElementTemplate<infer K> ? HTMLElementTagNameMap[K] :
	T extends SVGElementTemplate<infer K> ? SVGElementTagNameMap[K] :
	T extends string ? Text :
	T extends Node ? T :
	Node {
	var container = document.createElement("div");
	var pointer: HydrationPointer<HTMLElement> = {
		context: container,
		currentNode: null,
		isSVG: false,
		parentEffect: getEffect(),
		stopNode: null
	};
	
	hydrate(pointer, template);

	var firstChild = container.firstChild;

	if (firstChild === null) {
		throw new Error("Container is empty");
	}

	return firstChild as never;
}

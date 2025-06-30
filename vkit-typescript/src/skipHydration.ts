import { ServerElement } from "./createServerElement.js";
import { HTMLElementTemplate } from "./htmlTag.js";
import { HydrationPointer } from "./hydrate.js";
import { serverRender } from "./serverRender.js";
import { SVGElementTemplate } from "./svgTag.js";
import { CustomTemplate, Template } from "./Template.js";

export interface HydrationSkipper<P> extends CustomTemplate<P> {
	readonly template: Template<P>;
}

/**
 * Skips hydration and client side rendering of an HTML or SVG element.
 * It still renders the element on the server.
 * Note that it also skips client rendering later, so once the element
 * disappears, it will not appear again.
 * 
 * @example
 * function MyApp() {
 * 	return Div(
 * 		skipHydration(
 * 			Div(
 * 				"This will only be rendered on the server!"
 * 			)
 * 		),
 * 		Div("This will be rendered everywhere!")
 * 	);
 * }
 * @param content The HTML or SVG element template. It cannot be any other template.
 * @returns A template that gets rendered on the server but skipped on the client.
 */
export function skipHydration(content: HTMLElementTemplate<keyof HTMLElementTagNameMap>): HydrationSkipper<unknown>;

export function skipHydration(content: SVGElementTemplate<keyof SVGElementTagNameMap>): HydrationSkipper<unknown>;

export function skipHydration<P>(content: Template<P>): HydrationSkipper<P> {
	return {
		template: content,
		hydrate: hydrateHydrationSkipper,
		serverRender: serverRenderHydrationSkipper
	};
}

function hydrateHydrationSkipper<P>(
	hydrationPointer: HydrationPointer<P>
): void {
	if (hydrationPointer.currentNode !== null && hydrationPointer.currentNode !== hydrationPointer.stopNode) {
		hydrationPointer.currentNode = hydrationPointer.currentNode.nextSibling;
	}
}

function serverRenderHydrationSkipper(
	serverElement: ServerElement,
	template: HydrationSkipper<unknown>
): void {
	serverRender(serverElement, template.template);
}

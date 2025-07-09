import { ServerElement } from "./createServerElement.js";
import { HTMLElementTemplate } from "./htmlTag.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { serverRender } from "./serverRender.js";
import { SVGElementTemplate } from "./svgTag.js";
import { CustomTemplate, Template } from "./Template.js";

export interface SkipHydrationTemplate<P> extends CustomTemplate<P> {
	readonly template: Template<P>;
}

/**
 * Skips hydration of an HTML or SVG element.
 * It still renders the element on the server.
 * It also renders the element on the client if there is nothing to hydrate.
 * It can be used to avoid overwriting server-rendered content.
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
export function skipHydration(content: HTMLElementTemplate<keyof HTMLElementTagNameMap>): SkipHydrationTemplate<unknown>;

export function skipHydration(content: SVGElementTemplate<keyof SVGElementTagNameMap>): SkipHydrationTemplate<unknown>;

export function skipHydration<P extends ParentNode>(content: Template<P>): SkipHydrationTemplate<P> {
	return {
		template: content,
		hydrate: hydrateSkipHydration,
		serverRender: serverRenderSkipHydration
	};
}

function hydrateSkipHydration<P extends ParentNode>(
	hydrationPointer: HydrationPointer<P>,
	template: SkipHydrationTemplate<unknown>
): void {
	if (hydrationPointer.currentNode === null) {
		hydrate(hydrationPointer, template.template);
		return;
	}
	
	if (hydrationPointer.currentNode !== hydrationPointer.stopNode) {
		hydrationPointer.currentNode = hydrationPointer.currentNode.nextSibling;
	}
}

function serverRenderSkipHydration(
	serverElement: ServerElement,
	template: SkipHydrationTemplate<unknown>
): void {
	serverRender(serverElement, template.template);
}

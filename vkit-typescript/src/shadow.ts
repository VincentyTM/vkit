import { getEffect } from "./contextGuard.js";
import { directive } from "./directive.js";
import { empty } from "./empty.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { Template } from "./Template.js";

/**
 * Creates a directive that attaches a shadow root to an element.
 * Its arguments are inserted into the shadow DOM as contents.
 * @example
 * 
 * Div(
 * 	shadow(
 * 		H1("This element is in the shadow DOM")
 * 	)
 * )
 * @returns A directive that attaches a shadow root to an element and inserts nodes into it.
 */
export function shadow(...contents: readonly Template<ShadowRoot>[]): Template<Element>;

export function shadow(): Template<Element> {
	var contents: Template<ShadowRoot> = arguments;
	
	return directive(function(element: Element): void {
		var shadowRoot = element.shadowRoot || element.attachShadow({mode: "open"});
		empty(shadowRoot);

		var pointer: HydrationPointer<ShadowRoot> = {
			context: shadowRoot,
			currentNode: null,
			isSVG: false,
			parentEffect: getEffect(),
			stopNode: null
		};

		hydrate(pointer, contents);
	});
}

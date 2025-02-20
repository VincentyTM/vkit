import { bind } from "./bind.js";
import { append } from "./append.js";
import type { Template } from "./Template.js";

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
export function shadow(...contents: Template<ShadowRoot>[]): Template<HTMLElement>;

export function shadow(): Template<HTMLElement> {
	var contents: Template<ShadowRoot> = arguments;
	
	return function(element: HTMLElement): void {
		var shadowRoot = element.shadowRoot || element.attachShadow({mode: "open"});
		append(shadowRoot, contents, shadowRoot, bind);
	};
}

import { append } from "./append.js";
import { bind } from "./bind.js";
import { directive } from "./directive.js";
import { empty } from "./empty.js";
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
export function shadow(...contents: Template<ShadowRoot>[]): Template<Element>;

export function shadow(): Template<Element> {
	var contents: Template<ShadowRoot> = arguments;
	
	return directive(function(element: Element): void {
		var shadowRoot = element.shadowRoot || element.attachShadow({mode: "open"});
		empty(shadowRoot);
		append(shadowRoot, contents, bind);
	});
}

import { createEffect } from "./createEffect.js";
import { ClientRenderer } from "./hydrate.js";
import { noop } from "./noop.js";
import { CustomTemplate } from "./Template.js";
import { updateEffect } from "./updateEffect.js";

export interface DirectiveTemplate<P> extends CustomTemplate<P> {
	callback(element: P): void;
}

function clientRenderDirective<P>(
	clientRenderer: ClientRenderer<P>,
	template: DirectiveTemplate<P>
): void {
	var context = clientRenderer.context;
	var parentEffect = clientRenderer.parentEffect;
	var effect = createEffect(parentEffect, parentEffect.injector, function() {
		template.callback(context);
	});
	updateEffect(effect);
}

/**
 * Creates and returns a directive which can be used to observe or manipulate a DOM element.
 * Its callback function has a single parameter: the element.
 * 
 * Notes:
 * - The callback runs before the element is inserted into the DOM.
 * - Directives are evaluated in the browser only.
 * @example
 * function ElementLogger() {
 * 	return Div(
 * 		"Hello world",
 * 		directive(div => console.log(div))
 * 	);
 * }
 * @param callback The function that is called with the element as a parameter.
 * @returns The directive.
 */
export function directive<P>(callback: (element: P) => void): DirectiveTemplate<P> {
	return {
		callback: callback,
		hydrate: clientRenderDirective,
		serverRender: noop
	};
}

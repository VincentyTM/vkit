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

export function directive<P>(callback: (element: P) => void): DirectiveTemplate<P> {
	return {
		callback: callback,
		hydrate: clientRenderDirective,
		serverRender: noop
	};
}

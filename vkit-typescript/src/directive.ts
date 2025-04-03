import { getEffect } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { Pushable } from "./deepPush.js";
import { noop } from "./noop.js";
import { CustomTemplate } from "./Template.js";
import { updateEffect } from "./updateEffect.js";

export interface DirectiveTemplate<P> extends CustomTemplate<P> {
	callback(element: P): void;
}

function clientRenderDirective<P>(
	_array: Pushable,
	template: DirectiveTemplate<P>,
	context: P
): void {
	var parentEffect = getEffect();
	var effect = createEffect(parentEffect, parentEffect.injector, function() {
		template.callback(context);
	});
	updateEffect(effect);
}

export function directive<P>(callback: (element: P) => void): DirectiveTemplate<P> {
	return {
		callback: callback,
		clientRender: clientRenderDirective,
		serverRender: noop
	};
}

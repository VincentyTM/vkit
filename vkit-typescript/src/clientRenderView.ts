import { createEffect } from "./createEffect.js";
import { ClientRenderer, deepPush } from "./deepPush.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { updateEffect } from "./updateEffect.js";
import { ViewTemplate } from "./view.js";

export function clientRenderView<P extends ParentNode, T>(
	clientRenderer: ClientRenderer<P>,
	template: ViewTemplate<P, T>
): void {
	var parentElement = clientRenderer.context;
	var start = document.createTextNode("");
	var end = document.createTextNode("");
    var parentEffect = template.parentEffect;
	var signal = template.signal;

	var viewEffect = createEffect(parentEffect, parentEffect.injector, function(): void {
		var innerTemplate = template.getTemplate(signal ? signal.get() : null);
		var parent = start.parentNode;
		
		if (parent) {
			for (var el = end.previousSibling; el && el !== start; el = end.previousSibling) {
				parent.removeChild(el);
			}

			var innerPointer: HydrationPointer<P> = {
				context: parentElement,
				currentNode: end,
				parentEffect: clientRenderer.parentEffect,
				stopNode: end
			};
			
			hydrate(innerPointer, innerTemplate);
		} else {
			clientRenderer.add(start);
			deepPush(clientRenderer, innerTemplate);
			clientRenderer.add(end);
		}
	}, template.errorHandler);

	updateEffect(viewEffect);
	
	if (signal !== null) {
		signal.subscribe(function(): void {
			updateEffect(viewEffect);
		});
	}
}

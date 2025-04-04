import { bind } from "./bind.js";
import { createEffect } from "./createEffect.js";
import { ClientRenderer, deepPush, Pushable } from "./deepPush.js";
import { insert } from "./insert.js";
import { updateEffect } from "./updateEffect.js";
import { ViewTemplate } from "./view.js";

export function clientRenderView<P, T>(
	clientRenderer: ClientRenderer<P>,
	template: ViewTemplate<P, T>
): void {
	var array = clientRenderer.array;
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

			insert(innerTemplate, end, parentElement, true);
		} else {
			array.push(start);
			deepPush({
				array: array,
				context: parentElement,
				crossView: true,
				bind: bind
			}, innerTemplate);
			array.push(end);
		}
	}, template.errorHandler);

	updateEffect(viewEffect);
	
	if (signal !== null) {
		signal.subscribe(function(): void {
			updateEffect(viewEffect);
		});
	}
}

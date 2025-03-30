import { createEffect } from "./createEffect.js";
import { Pushable } from "./deepPush.js";
import { insert } from "./insert.js";
import { Template } from "./Template.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { ViewTemplate } from "./view.js";

export function clientRenderView<P extends ParentNode, T>(
	array: Pushable<Template<P>>,
	template: ViewTemplate<P, T>
): void {
	var start = document.createTextNode("");
	var end = document.createTextNode("");
    var parentEffect = template.parentEffect;

	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		var currentView = template.getTemplate(signal ? signal.get() : null);
		var parent = start.parentNode;
		
		if (parent) {
			for (var el = end.previousSibling; el && el !== start; el = end.previousSibling) {
				parent.removeChild(el);
			}

			insert(currentView, end, parent as P, true);
		}
	}, template.errorHandler);

	var signal = template.signal;
	
	if (signal !== null) {
		signal.subscribe(function(): void {
			updateEffect(effect);
		});
	}
	
	enqueueUpdate(function(): void {
		updateEffect(effect);
	});

    array.push(start);
    array.push(end);
}

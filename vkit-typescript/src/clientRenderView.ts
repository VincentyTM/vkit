import { createEffect } from "./createEffect.js";
import { Pushable } from "./deepPush.js";
import { nodeRange } from "./nodeRange.js";
import { Template } from "./Template.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { ViewTemplate } from "./view.js";

export function clientRenderView<P, T>(
	array: Pushable<Template<P>>,
	template: ViewTemplate<P, T>
): void {
    var parentEffect = template.parentEffect;
	var effect = createEffect(parentEffect, parentEffect.injector, mount);
	var range = nodeRange(true);
	var signal = template.signal;
	
	if (signal !== null) {
		signal.subscribe(function(): void {
			updateEffect(effect);
		});
	}
	
	function mount(): void {
		var currentView = template.getTemplate(signal ? signal.get() : null);
		
		if (range.start.nextSibling) {
			range.clear();
			range.append(currentView);
		}
	}
	
	enqueueUpdate(function(): void {
		updateEffect(effect);
	});

    array.push(range.start);
    array.push(range.end);
}

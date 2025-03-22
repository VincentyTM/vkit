import { getComponent } from "./contextGuard.js";
import { createComponent, Component } from "./createComponent.js";
import { onDestroy } from "./onDestroy.js";
import { Signal } from "./signal.js";

export function signalEffect<T>(
	this: Signal<T>,
	callback: (
		value: T,
		onCleanup?: (
			callback: () => void,
			component?: Component | null
		) => void
	) => void
): () => void {
	var signal = this;
	var prev = getComponent(true);
	
	if (prev) {
		var component = createComponent(function() {
			callback(signal.get(), onDestroy);
		});
		component.render();

		return signal.subscribe(component.render);
	}

	callback(signal.get());

	return signal.subscribe(function(value: T) {
		callback(value);
	});
}

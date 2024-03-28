import {getComponent} from "./contextGuard.js";
import createComponent, {type Component} from "./createComponent.js";
import onUnmount from "./onUnmount.js";
import type {Signal} from "./signal.js";

export default function signalEffect<T>(
	this: Signal<T>,
	callback: (
		value: T,
		onCleanup?: (
			callback: () => void,
			component?: Component | null
		) => (callback: () => void) => void
	) => void
): () => void {
	var signal = this;
	var prev = getComponent(true);
	
	if (prev) {
		var component = createComponent(function() {
			callback(signal.get(), onUnmount);
		});
		component.render();

		return signal.subscribe(component.render);
	}

	callback(signal.get());

	return signal.subscribe(function(value: T) {
		callback(value);
	});
}

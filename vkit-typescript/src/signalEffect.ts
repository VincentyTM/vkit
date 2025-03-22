import { getEffect } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { onDestroy } from "./onDestroy.js";
import { Signal } from "./signal.js";

export function signalEffect<T>(
	this: Signal<T>,
	callback: (
		value: T,
		onCleanup?: (
			callback: () => void,
			effect?: Effect | undefined
		) => void
	) => void
): () => void {
	var signal = this;
	var prev = getEffect(true);
	
	if (prev) {
		var effect = createEffect(function() {
			callback(signal.get(), onDestroy);
		});
		effect.render();

		return signal.subscribe(effect.render);
	}

	callback(signal.get());

	return signal.subscribe(function(value: T) {
		callback(value);
	});
}

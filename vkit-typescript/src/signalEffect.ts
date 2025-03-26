import { Signal } from "./computed.js";
import { getEffect, getInjector } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { onDestroy } from "./onDestroy.js";
import { updateEffect } from "./updateEffect.js";

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
		var effect = createEffect(prev, getInjector(), function(): void {
			callback(signal.get(), onDestroy);
		});

		updateEffect(effect);

		return signal.subscribe(function(): void {
			updateEffect(effect);
		});
	}

	callback(signal.get());

	return signal.subscribe(function(value: T): void {
		callback(value);
	});
}

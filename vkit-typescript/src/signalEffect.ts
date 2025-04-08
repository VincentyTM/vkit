import { Signal } from "./computed.js";
import { getEffect } from "./contextGuard.js";
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
): void {
	var signal = this;
	var parentEffect = getEffect(true);
	
	if (parentEffect) {
		var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
			callback(signal.get(), onDestroy);
		});

		updateEffect(effect);

		signal.subscribe(function(): void {
			updateEffect(effect);
		});
	}

	callback(signal.get());

	signal.subscribe(function(value: T): void {
		callback(value);
	});
}

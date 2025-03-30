import { getEffect } from "./contextGuard.js";
import { Pushable } from "./deepPush.js";
import { onDestroy } from "./onDestroy.js";
import { MutableRef } from "./ref.js";
import { Template } from "./Template.js";

export function clientRenderRef<P>(
	_array: Pushable<Template<P>>,
	ref: MutableRef<P>,
	context: P
): void {
	if (ref.current !== null) {
		throw new Error("This reference has already been set.");
	}

	ref.current = context;

	if (getEffect() !== ref.effect) {
		onDestroy(function(): void {
			ref.current = null;
		});
	}
}

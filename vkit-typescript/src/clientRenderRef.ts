import { getEffect } from "./contextGuard.js";
import { ClientRendererBase } from "./deepPush.js";
import { onDestroy } from "./onDestroy.js";
import { MutableRef } from "./ref.js";

export function clientRenderRef<P>(
	clientRenderer: ClientRendererBase<P>,
	ref: MutableRef<P>
): void {
	if (ref.current !== null) {
		throw new Error("This reference has already been set.");
	}

	ref.current = clientRenderer.context;

	if (getEffect() !== ref.effect) {
		onDestroy(function(): void {
			ref.current = null;
		});
	}
}

import { ClientRenderer } from "./hydrate.js";
import { onDestroy } from "./onDestroy.js";
import { MutableRef } from "./ref.js";

export function clientRenderRef<P>(
	clientRenderer: ClientRenderer<P>,
	ref: MutableRef<P>
): void {
	if (ref.current !== null) {
		throw new Error("This reference has already been set.");
	}

	ref.current = clientRenderer.context;

	if (clientRenderer.parentEffect !== ref.effect) {
		onDestroy(function(): void {
			ref.current = null;
		});
	}
}

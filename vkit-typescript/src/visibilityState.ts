import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";

export function visibilityState(): Signal<boolean> {
	var win = getWindow();

	if (!win) {
		return computed(function(): boolean {
			return true;
		});
	}

	var doc = win.document;
	
	var visibility = computed(function(): boolean {
		return doc.visibilityState === "visible" || !doc.visibilityState;
	});
	
	onDestroy(
		onEvent(doc, "visibilitychange", function(): void {
			visibility.invalidate();
		})
	);
	
	return visibility;
}

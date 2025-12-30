import { getWindow } from "./getWindow.js";
import { onEvent } from "./onEvent.js";
import { onDestroy } from "./onDestroy.js";
import { Signal } from "./computed.js";
import { effect } from "./effect.js";

function prevent(e: Event): "" {
	if (e.preventDefault) {
		e.preventDefault();
	}
	return "";
}

/**
 * Adds a `beforeunload` event listener to the current window when the given condition is true,
 * making the browser show a confirmation dialog before leaving the current page.
 * 
 * Removes the listener when the given condition is false or the current reactive context is destroyed.
 * @example
 * function SaveButton() {
 * 	const hasUnsavedChanges = signal(true);
 * 
 * 	unsavedGuard(hasUnsavedChanges);
 * 
 * 	return Button("Save", {
 * 		disabled: () => !hasUnsavedChanges(),
 * 		onclick() {
 * 			hasUnsavedChanges.set(false);
 * 		}
 * 	});
 * }
 * @param condition A dynamic boolean value.
 * When true, the event listener is added to the window.
 * When false, it is removed.
 */
export function unsavedGuard(condition: Signal<boolean> | (() => boolean)): void {
	effect(function() {
		if (condition()) {
			var win = getWindow();

			if (win) {
				onDestroy(onEvent(win, "beforeunload", prevent));
			}
		}
	});
}

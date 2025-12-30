import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";

/**
 * Schedules a callback to be run when the current reactive context is destroyed.
 * @param destroyHandler The handler that listens to the destroy event.
 */
export function onDestroy(destroyHandler: () => void): void {
	var effect = getEffect();

	var e: Effect | undefined = effect;

	while (e && e.destroyHandlers === undefined) {
		e.destroyHandlers = [];

		if (e.parent) {
			if (e.parent.children) {
				e.parent.children.push(e);
			} else {
				e.parent.children = [e];
			}
		}

		e = e.parent;
	}

	effect!.destroyHandlers!.push(destroyHandler);
}

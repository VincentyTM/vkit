import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { rootEffect } from "./root.js";

/**
 * Schedules a callback to be run when the current reactive context is destroyed.
 * @param callback The handler that listens to the destroy event.
 * @param effect The effect whose destroy event is handled. By default, it is the current effect.
 */
export function onDestroy(
	callback: () => void,
	effect?: Effect | undefined
): void {
	if (!effect) {
		effect = getEffect();
	}
	
	if (effect === rootEffect) {
		return;
	}
	
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
	
	effect!.destroyHandlers!.push(callback);
}

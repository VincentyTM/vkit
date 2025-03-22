import { Effect } from "./createEffect.js";
import { onDestroy } from "./onDestroy.js";

/**
 * @deprecated Use `onDestroy` instead.
 */
export function onUnmount(
	callback: () => void,
	effect?: Effect | null
): void {
    onDestroy(callback, effect);
}

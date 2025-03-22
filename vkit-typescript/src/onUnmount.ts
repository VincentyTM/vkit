import { Effect } from "./createEffect.js";
import { onDestroy } from "./onDestroy.js";

/**
 * @deprecated Use `onDestroy` instead.
 */
export function onUnmount(
	callback: () => void,
	effect?: Effect | undefined
): void {
    onDestroy(callback, effect);
}

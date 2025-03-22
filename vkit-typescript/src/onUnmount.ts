import { Component } from "./createComponent.js";
import { onDestroy } from "./onDestroy.js";

/**
 * @deprecated Use `onDestroy` instead.
 */
export function onUnmount(
	callback: () => void,
	component?: Component | null
) : (callback: () => void) => void {
    return onDestroy(callback, component);
}

import { onDestroy } from "./onDestroy.js";

/**
 * @deprecated Use `onDestroy` instead.
 */
export function onUnmount(destroyHandler: () => void): void {
    onDestroy(destroyHandler);
}

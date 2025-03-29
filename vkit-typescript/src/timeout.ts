import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";

/**
 * Sets a timeout in the current window and clears it when the current reactive context is destroyed.
 * @example
 * timeout(() => {
 * 	console.log("Timeout is over!");
 * }, 1000);
 * The @param callback function runs once after @param delay milliseconds.
 */
export function timeout(callback: () => void, delay: number): void {
	var win = getWindow()!;
	var timeout = win.setTimeout(callback, delay);
	
	onDestroy(clear);
	
	function clear(): void {
		win.clearTimeout(timeout);
	}
}

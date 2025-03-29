import { effect } from "./effect.js";
import { getGlobalContext } from "./getGlobalContext.js";
import { onDestroy } from "./onDestroy.js";

/**
 * Sets a timeout in the current global context and clears it when the current reactive context is destroyed.
 * @example
 * timeout(() => {
 * 	console.log("Timeout is over!");
 * }, 1000);
 * The @param callback function runs once after @param delay milliseconds.
 */
export function timeout(callback: () => void, delay: number): void {
	effect(function(): void {
		var global = getGlobalContext();
		var timeout = global.setTimeout(callback, delay);
		
		onDestroy(function(): void {
			global.clearTimeout(timeout);
		});
	});
}

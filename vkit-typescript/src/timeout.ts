import { effect } from "./effect.js";
import { getGlobalContext } from "./getGlobalContext.js";
import { onDestroy } from "./onDestroy.js";

/**
 * Schedules a timeout in the current execution context (worker, window, or server app)
 * that will be canceled if the current reactive context is destroyed. This timeout
 * will not be set if effects are disabled (for example, during server-side rendering).
 * 
 * The provided callback function will be executed once after the specified delay
 * in milliseconds.
 * 
 * @example
 * timeout(() => {
 * 	console.log("Timeout is over!");
 * }, 1000);
 * 
 * @param callback The function to be executed after the specified delay.
 * @param delay The duration to wait before executing the callback, in milliseconds.
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

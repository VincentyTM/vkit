import { effect } from "./effect.js";
import { getGlobalContext } from "./getGlobalContext.js";
import { onDestroy } from "./onDestroy.js";

/**
 * Schedules a periodic interval in the current execution context (worker, window, or server app)
 * that runs the provided callback function. This interval will be canceled if the current reactive
 * context is destroyed. It will not be set if effects are disabled (for example, during
 * server-side rendering).
 * 
 * The provided callback function will be executed repeatedly at the specified interval.
 * 
 * @example
 * interval(() => {
 * 	console.log("Date and time:", new Date().toLocaleString());
 * }, 1000);
 * 
 * @param callback The function to be executed periodically.
 * @param delay The duration to wait between successive function calls, in milliseconds.
 */
export function interval(callback: () => void, delay: number): void {
	effect(function(): void {
		var global = getGlobalContext();
		var interval = global.setInterval(callback, delay);

		onDestroy(function(): void {
			global.clearInterval(interval);
		});
	});
}

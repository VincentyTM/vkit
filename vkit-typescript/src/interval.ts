import { effect } from "./effect.js";
import { getGlobalContext } from "./getGlobalContext.js";
import { onDestroy } from "./onDestroy.js";

/**
 * Sets an interval in the current global context and clears it when the current reactive context is destroyed.
 * @example
 * interval(() => {
 * 	console.log("Date and time:", new Date().toLocaleString());
 * }, 1000);
 * @param callback A function which runs periodically.
 * @param delay The time delay in milliseconds between two function calls.
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

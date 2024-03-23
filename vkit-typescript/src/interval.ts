import getWindow from "./getWindow.js";
import onUnmount from "./onUnmount.js";
import update from "./update.js";

/**
 * Sets an interval in the current window and clears it when the current component is unmounted.
 * @example
 * interval(() => {
 * 	console.log("Date and time:", new Date().toLocaleString());
 * }, 1000);
 * @param callback A function which runs periodically.
 * @param delay The time delay in milliseconds between two function calls.
 */
export default function createInterval(callback: () => void, delay: number): void {
	var win = getWindow()!;
	var interval = win.setInterval(tick, delay);
	
	onUnmount(clear);
	
	function tick(): void {
		callback();
		update();
	}
	
	function clear(): void {
		win.clearInterval(interval);
	}
}

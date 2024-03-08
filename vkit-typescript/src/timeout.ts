import getWindow from "./getWindow.js";
import onUnmount from "./onUnmount.js";
import update from "./update.js";

/**
 * Sets a timeout in the current window and clears it when the current component is unmounted.
 * @example
 * timeout(() => {
 * 	console.log("Timeout is over!");
 * }, 1000);
 * The @param callback function runs once after @param delay milliseconds.
 */
export default function createTimeout(callback: () => void, delay: number): void {
	var win = getWindow();
	var timeout = win.setTimeout(tick, delay);
	
	onUnmount(clear);
	
	function tick(): void {
		callback();
		update();
	}
	
	function clear(): void {
		win.clearTimeout(timeout);
	}
}

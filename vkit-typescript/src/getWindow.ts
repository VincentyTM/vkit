import getContext from "./getContext.js";
import inject from "./inject.js";
import type { View } from "./view.js";

type WindowService = {
	new(): WindowService;
	context: (getView: () => View) => any;
	data: {[key: string]: any} | null;
	window: Window & typeof globalThis;
};

export var WindowService = function(this: WindowService) {
	this.context = getContext();
	this.data = null;
	this.window = window;
} as unknown as WindowService;

/**
 * Returns the window of the current component.
 * It is useful in multi-window applications and iframes.
 * It returns null on the server.
 * @example
 * const window = getWindow();
 * 
 * if (window) {
 * 	bind(window, {
 * 		onload() {
 * 			console.log("The window has loaded!");
 * 		}
 * 	});
 * }
 * 
 * @returns The current window.
 */
export default function getWindow(): Window & typeof globalThis | null {
	return inject(WindowService).window;
}

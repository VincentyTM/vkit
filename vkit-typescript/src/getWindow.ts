import { getContext } from "./getContext.js";
import { inject } from "./inject.js";
import { Template } from "./Template.js";

type WindowService = {
	new(): WindowService;
	context: (getView: () => Template) => any;
	data: {[key: string]: any} | null;
	window: Window & typeof globalThis;
};

export var WindowService = function(this: WindowService) {
	this.context = getContext();
	this.data = null;
	this.window = window;
} as unknown as WindowService;

/**
 * Returns the current window.
 * It is useful in multi-window applications and iframes.
 * It returns null on the server.
 * @example
 * effect(() => {
 * 	console.log("Window:", getWindow());
 * });
 * 
 * @returns The current window.
 */
export function getWindow(): Window & typeof globalThis | null {
	return inject(WindowService).window;
}

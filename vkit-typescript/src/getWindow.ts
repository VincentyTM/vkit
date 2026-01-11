import { createInjectable } from "./createInjectable.js";
import { inject } from "./inject.js";

interface WindowService {
	window: Window & typeof globalThis | null;
}

export var WindowService = createInjectable(function(): WindowService {
	return {
		window: null
	};
});

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

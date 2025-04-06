import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { createInjectable } from "./createInjectable.js";
import { inject } from "./inject.js";
import { WindowData } from "./windowData.js";

interface WindowService {
	data: Record<string, WindowData<any>> | null;
	effect: Effect;
	window: Window & typeof globalThis | null;
}

export var WindowService = createInjectable(function(): WindowService {
	return {
		data: null,
		effect: getEffect(),
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

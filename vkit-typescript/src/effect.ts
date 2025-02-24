import { createComponent } from "./createComponent.js";

/**
 * Creates a side effect and runs it every time its dependencies change.
 * @example
 * const shouldRunInterval = signal(true);
 * 
 * effect(() => {
 * 	if (!shouldRunInterval()) {
 * 		return;
 * 	}
 * 	
 * 	const interval = setInterval(() => {
 * 		console.log("The current time is:", Date.now());
 * 	}, 1000);
 * 	
 * 	onUnmount(() => clearInterval(interval));
 * });
 * @param callback A callback function which is called initially and when any of its dependencies change.
 * In order to clean up side effects, call onUnmount within the callback.
 */
export function effect(callback: () => void): void {
	createComponent(callback).render();
}

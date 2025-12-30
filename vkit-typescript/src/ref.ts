import { clientRenderRef } from "./clientRenderRef.js";
import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { noop } from "./noop.js";
import { CustomTemplate } from "./Template.js";

export interface MutableRef<T> extends CustomTemplate<T> {
	current: T | null;
	readonly effect: Effect | undefined;
}

export interface Ref<T> extends CustomTemplate<T> {
	readonly current: T | null;
}

/**
 * Creates and returns a reference which can contain any object (usually an element) or null.
 * You can get its current value with its `current` property.
 * @example
 * function MyComponent() {
 * 	const input = ref();
 * 
 * 	return [
 * 		Input(input),
 * 		Button("Focus", {
 * 			onclick() {
 * 				if (input.current) {
 * 					input.current.focus();
 * 				}
 * 			}
 * 		})
 * 	];
 * }
 * @returns A function directive which binds an element (or any other object) to the reference until the current reactive context is destroyed.
 */
export function ref<T = HTMLElement | SVGElement>(): Ref<T> {
	var reference: MutableRef<T> = {
		current: null,
		effect: getEffect(true),
		hydrate: clientRenderRef,
		serverRender: noop
	};

	return reference;
}

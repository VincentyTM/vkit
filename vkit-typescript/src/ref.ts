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
 * Creates a reference template (`Ref`) that enables extraction of a DOM element reference from a template.
 * 
 * You can get its current value via its `current` property. When the reference template is rendered,
 * the `current` property is bound to the container element until the current reactive context is destroyed.
 * If the reference template is not rendered, the `current` property will be `null`.
 * 
 * An error will be thrown if the same reference is simultaneously bound to multiple DOM elements.
 * 
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
 * 
 * @returns The reference template.
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

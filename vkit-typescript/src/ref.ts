import { getEffect } from "./contextGuard.js";
import { directive, DirectiveTemplate } from "./directive.js";
import { onDestroy } from "./onDestroy.js";
import { CustomTemplate } from "./Template.js";

interface MutableRef<T> extends DirectiveTemplate<T> {
	current: T | null;
}

interface Ref<T> extends CustomTemplate<T> {
	readonly current: T | null;
}

/**
 * Creates and returns a reference which can contain any object (usually an HTML element) or null.
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
export function ref<T = HTMLElement>(): Ref<T> {
	function reset(): void {
		reference.current = null;
	}
	
	var reference = directive(function(value: T): void {
		if (reference.current) {
			throw new Error("This reference has already been set.");
		}
		
		reference.current = value;
		
		if (getEffect() !== effect) {
			onDestroy(reset);
		}
	}) as MutableRef<T>;
	
	var effect = getEffect(true);
	reference.current = null;
	return reference;
}

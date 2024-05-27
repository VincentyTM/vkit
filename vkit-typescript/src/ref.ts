import {getComponent} from "./contextGuard.js";
import onUnmount from "./onUnmount.js";

type MutableRef<T> = {
	(value: T): void;
	current: T | null;
};

type Ref<T> = {
	(value: T): void;
	readonly current: T | null;
};

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
 * @returns A function directive which binds an element (or any other object) to the reference until the current component unmounts.
 */
export default function createRef<T = HTMLElement>(): Ref<T> {
	function reset(): void {
		ref.current = null;
	}
	
	var ref = function(value: T): void {
		if (ref.current) {
			throw new Error("This reference has already been set.");
		}
		
		ref.current = value;
		
		if (getComponent() !== component) {
			onUnmount(reset);
		}
	} as MutableRef<T>;
	
	var component = getComponent(true);
	ref.current = null;
	return ref;
}

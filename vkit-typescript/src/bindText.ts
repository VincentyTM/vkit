import type { WritableSignal } from "./signal.js";
import type { View } from "./view.js";

/**
 * Sets up a two-way data binding between a writable signal and an input or textarea element.
 * It sets the element's value to the signal's current value.
 * When the value of the signal changes, so does the element's and vice versa.
 * @example
 * function TextBindings() {
 * 	const text = signal("Hello world");
 * 	
 * 	return [
 * 		H1(text),
 * 		Input(bindText(text)),
 * 		Br(),
 * 		Textarea(bindText(text))
 * 	];
 * }
 * 
 * @param signal The writable signal containing a string that is always synchronized with the element's value.
 * @returns A directive which can be used on an input or textarea element (or even multiple elements) to create the binding(s).
 */
export default function bindText(signal: WritableSignal<string>): View<HTMLInputElement> & View<HTMLTextAreaElement> {
	function update(this: HTMLInputElement | HTMLTextAreaElement): void {
		signal.set(this.value);
	}
	
	return {
		onchange: update,
		oninput: update,
		onkeyup: update,
		value: signal
	};
}

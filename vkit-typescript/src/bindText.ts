import { WritableSignal } from "./signal.js";
import { Template } from "./Template.js";

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
 * @returns A template that can be used in an input or textarea element to create a binding.
 */
export function bindText<P extends HTMLInputElement | HTMLTextAreaElement>(signal: WritableSignal<string>): Template<P>;

export function bindText(signal: WritableSignal<string>): Template<HTMLInputElement | HTMLTextAreaElement> {
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

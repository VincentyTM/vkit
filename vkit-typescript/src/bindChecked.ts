import type { WritableSignal } from "./signal.js";
import type { View } from "./view.js";

/**
 * Sets up a two-way data binding between a boolean writable signal and a checkbox input element.
 * It sets the element's value to the signal's current value.
 * When the value of the signal changes, so does the element's and vice versa.
 * @example
 * function CheckboxBinding() {
 * 	const isDone = signal(false);
 * 	
 * 	return [
 * 		H1(() => isDone() ? "Done!" : "Not done yet."),
 * 		Label(
 * 			Input(bindCheckbox(isDone), {type: "checkbox"}),
 * 			" Some task"
 * 		)
 * 	];
 * }
 * 
 * @param signal The writable signal containing a boolean value which is always true if the checkbox is checked and false otherwise.
 * @returns A directive which can be used on a checkbox input element (or even multiple elements) to create the binding(s).
 */
export function bindChecked(signal: WritableSignal<boolean>): View<HTMLInputElement> {
	return {
		checked: signal,
		onchange: function() {
			signal.set(this.checked);
		}
	};
}

import { computed } from "./computed.js";
import { WritableSignal } from "./signal.js";
import { Template } from "./Template.js";

/**
 * Sets up a two-way data binding with number conversion between a writable signal and an input element.
 * It is best suited for number and range type inputs.
 * It sets the element's value to the signal's current value.
 * When the value of the signal changes, so does the element's and vice versa.
 * @example
 * function NumberBinding() {
 * 	const percentage = signal(50);
 * 	const min = 0;
 * 	const max = 100;
 * 	const step = 1;
 * 	
 * 	return [
 * 		H1(percentage, "%"),
 * 		Input(bindNumber(percentage), {type: "number", min, max, step}),
 * 		Input(bindNumber(percentage), {type: "range", min, max, step})
 * 	];
 * }
 * 
 * @param signal The writable signal containing a number that is always synchronized with the element's value.
 * @param defaultValue An optional default value. When the input's value is cleared, the signal is set to this value.
 * If there is no default value given, the signal's value is not set in that case.
 * @returns A template that can be used in an input element to create a binding.
 */
export function bindNumber(signal: WritableSignal<number>, defaultValue?: number): Template<HTMLInputElement> {
	function set(this: HTMLInputElement): void {
		if (this.value === "" && defaultValue !== undefined) {
			signal.set(defaultValue);
			return;
		}
		
		var value = parseFloat(this.value);
		
		if (!isNaN(value) && isFinite(value)) {
			signal.set(value);
		}
	}
	
	return {
		oninput: set,
		onchange: set,
		onkeyup: set,
		value: computed(String, [signal])
	};
}

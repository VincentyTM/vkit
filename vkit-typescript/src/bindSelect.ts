import { tick } from "./tick.js";
import type { WritableSignal } from "./signal.js";
import type { Template } from "./Template.js";

/**
 * Sets up a two-way data binding between a writable signal and a <select> HTML element.
 * When the value of the signal changes, so does the select's value and vice versa.
 * @example
 * function SelectBinding() {
 * 	const value = signal("banana");
 * 	
 * 	return Select(
 * 		bindSelect(value),
 * 		Option({value: "apple", label: "Apple"}),
 * 		Option({value: "banana", label: "Banana"}),
 * 		Option({value: "orange", label: "Orange"})
 * 	);
 * }
 * 
 * @param signal A signal that can be read from and written to.
 * @returns A directive that can be applied on a <select> element.
 */
export function bindSelect(signal: WritableSignal<string>): Template<HTMLSelectElement> {
	return [
		function(el) {
			function updateValue(): void {
				el.value = signal.get();
			}
			
			signal.effect(function() {
				tick(updateValue);
			});
		},
		
		{
			onchange: function() {
				signal.set(this.value);
			}
		}
	];
}

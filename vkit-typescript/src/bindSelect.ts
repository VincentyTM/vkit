import { directive } from "./directive.js";
import { WritableSignal } from "./signal.js";
import { Template } from "./Template.js";
import { tick } from "./tick.js";

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
 * @returns A template that can be used in a select element to create a binding.
 */
export function bindSelect(signal: WritableSignal<string>): Template<HTMLSelectElement> {
	return [
		directive(function(el: HTMLSelectElement): void {
			var value = signal();

			tick(function(): void {
				el.value = value;
			});
		}),
		
		{
			value: signal,
			onchange: function(this: HTMLSelectElement): void {
				signal.set(this.value);
			}
		}
	];
}

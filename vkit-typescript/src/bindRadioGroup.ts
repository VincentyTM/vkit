import { computed, Signal } from "./computed.js";
import { isSignal } from "./isSignal.js";
import { WritableSignal } from "./signal.js";
import { Template } from "./Template.js";

export interface RadioGroupBinding<T extends string> {
	bindOption(inputValue: T | Signal<T>): Template<HTMLInputElement>;
}

interface RadioGroupBindingInternals<T extends string> extends RadioGroupBinding<T> {
	currentValue: WritableSignal<T>;
	name: string | Signal<string>;
}

/**
 * Creates and returns an object that can be used to bind a writable signal to
 * multiple radio buttons in a type-safe way.
 * Make sure to use a unique name and that all radio buttons in the group are
 * rendered in the same form (or all are form-less) so browser-native mutual
 * exclusion works.
 * 
 * Warning: avoid using the same name for non-radio form controls in the same
 * form — name collisions can produce surprising form.elements behavior.
 * 
 * @example
 * function FruitRadioChoices() {
 * 	const fruit = signal<"apple" | "banana">("apple");
 * 	const fruitBinding = bindRadioGroup("fruit", fruit);
 * 
 * 	return [
 * 		Label(
 * 			Input(
 * 				{ type: "radio" },
 * 				fruitBinding.bindOption("apple")
 * 			),
 * 			" Apple"
 * 		),
 * 		Br(),
 * 		Label(
 * 			Input(
 * 				{ type: "radio" },
 * 				fruitBinding.bindOption("banana")
 * 			),
 * 			" Banana"
 * 		)
 * 	];
 * }
 * @param name The name shared by each radio button in the group.
 * @param currentValue The writable signal that holds the current value of the radio group.
 * @returns An object with a `bindOption` function. `bindOption` accepts a value
 * (or a signal of that value) and returns attributes for an <input type="radio">
 * that keep the radio and the writable signal synchronized.
 */
export function bindRadioGroup<T extends string>(
	name: string | Signal<string>,
	currentValue: WritableSignal<T>
): RadioGroupBinding<T> {
	var binding: RadioGroupBindingInternals<T> = {
		currentValue: currentValue,
		name: name,
		bindOption: bindRadioGroupOption
	};

	return binding;
}

function bindRadioGroupOption<T extends string>(this: RadioGroupBindingInternals<T>, inputValue: T | Signal<T>): Template<HTMLInputElement> {
	var currentValue = this.currentValue;
	var name = this.name;

	return {
		checked: computed(getAreEqual, [currentValue, inputValue]),
		name: name,
		value: inputValue,
		onchange: function() {
			currentValue.set(isSignal(inputValue) ? inputValue.get() : inputValue);
		}
	};
}

function getAreEqual<T extends string>(currentValue: T, inputValue: T): boolean {
	return currentValue === inputValue;
}

import { Signal } from "./computed.js";
import { effect } from "./effect.js";

/**
 * Subscribes a change handler to a signal. The handler runs only when the
 * signal's value changes. It is not invoked for the initial value.
 * The subscription is automatically removed when the current reactive context is destroyed.
 * @example
 * const count = signal(0);
 * 
 * onChange(count, (value) => {
 * 	console.log(`Count has changed to ${count}`);
 * });
 * 
 * count.set(1);
 * 
 * @param input The signal to observe.
 * @param callback Called with the new value whenever the signal changes.
 */
export function onChange<T>(input: Signal<T>, callback: (value: T) => void): void {
	var initial = true;

	effect(function() {
		var value = input();

		if (initial) {
			initial = false;
			return;
		}

		callback(value);
	});
}

import { computed, Signal } from "./computed.js";
import { effect } from "./effect.js";
import { timeout } from "./timeout.js";

/**
 * Creates a new signal that mirrors the provided signal's value with a delay.
 * @example
 * function Search() {
 * 	const query = signal("");
 * 	const debouncedQuery = debounce(query, 1000);
 * 
 * 	return [
 * 		Input(bindText(query)),
 * 		P("You have typed: ", debouncedQuery)
 * 	];
 * }
 * 
 * @param input The input signal.
 * @param delay The delay in milliseconds.
 * @returns The new signal with the deferred value.
 */
export function debounce<T>(input: Signal<T>, delay: number): Signal<T> {
	var output = computed(function() {
		return input.get();
	});

	var invalidate = output.invalidate;

	effect(function() {
		input();
		timeout(invalidate, delay);
	});

	return output;
}

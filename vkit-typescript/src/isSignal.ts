import { Signal } from "./computed.js";

/**
 * Takes a value and returns whether it is a signal.
 * @param value The value to be checked.
 * @returns A boolean which is true if the input value is a signal, false otherwise.
 */
export function isSignal(value: any): value is Signal<unknown> {
	return !!(value && value.isSignal === true);
}

import type { WritableSignal } from "./signal.js";

/**
 * Takes a value and returns whether it is a writable signal.
 * @param value The value to be checked.
 * @returns A boolean which is true if the input value is a writable signal, false otherwise.
 */
export default function isWritableSignal(value: any): value is WritableSignal<unknown> {
	return !!(value && value.isSignal === true && value.set);
}

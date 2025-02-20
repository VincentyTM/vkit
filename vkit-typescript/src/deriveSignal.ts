import type { WritableSignal } from "./signal.js";
import { writable } from "./writable.js";

/**
 * Creates and returns a writable signal derived from another writable signal.
 * 
 * In contrast with a computed signal, its value can be written, for example with the `set` method.
 * However, it actually updates the parent signal and this change only propagates down to the new signal during the next update.
 * @example
 * const selectLastDigit = (x: number) => x % 10;
 * const updateLastDigit = (x: number, y: number) => Math.floor(x / 10) + y;
 * const count = signal(42);
 * const countLastDigit = deriveSignal(count, selectLastDigit, updateLastDigit);
 * 
 * @param parent A writable signal to derive the new value from and handle updates.
 * @param selector A pure function that describes how the signal's latest value is calculated from its parent.
 * @param updater A pure function that describes how the parent signal's value is updated.
 * @returns A writable signal that contains the transformed value and delegates updates to its parent.
 */
export function deriveSignal<T, U>(
	parent: WritableSignal<T>,
	selector: (parentValue: T) => U,
	updater: (parentValue: T, value: U) => T
): WritableSignal<U> {
	return writable(parent.map(selector), function(value: U): void {
		parent.set(updater(parent.get(), value));
	});
}

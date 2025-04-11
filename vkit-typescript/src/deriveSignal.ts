import { computed, Signal } from "./computed.js";
import { isSignal } from "./isSignal.js";
import { WritableSignal } from "./signal.js";
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
 * @param key A parameter passed to `selectValue` and `updateValue`.
 * @param selectValue A pure function that describes how the signal's latest value is calculated from its parent.
 * @param updateValue A pure function that describes how the parent signal's value is updated.
 * @returns A writable signal that contains the transformed value and delegates updates to its parent.
 */
 export function deriveSignal<T, K, U>(
	parent: WritableSignal<T>,
	key: K | Signal<K>,
	selectValue: (parentValue: T, currentKey: K) => U,
	updateValue: (parentValue: T, currentKey: K, value: U) => T
): WritableSignal<U> {
	return writable(computed(selectValue, [parent, key]), function(value: U): void {
        parent.set(updateValue(parent.get(), isSignal(key) ? key.get() : key, value));
    });
}

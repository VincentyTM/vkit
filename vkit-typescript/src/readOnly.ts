import { computed, ComputedSignal } from "./computed.js";
import { WritableSignal } from "./signal.js";

function getSelf<T>(value: T): T {
	return value;
}

/**
 * Takes a writable signal and returns a computed signal that has the same value.
 * It can be used to "lock" a signal so that nobody can modify its value from the outside.
 * @example
 * function OneMinuteCountdown() {
 * 	const secondsLeft = signal(60);
 * 
 * 	effect(() => {
 * 		if (is(() => secondsLeft() > 0)) {
 * 			interval(() => secondsLeft.set(secondsLeft.get() - 1), 1000);
 * 		}
 * 	});
 * 
 * 	return readOnly(secondsLeft);
 * }
 * 
 * @param input The writable signal that provides the value.
 * @returns The computed signal that is synchronized with it.
 */
export function readOnly<T>(input: WritableSignal<T>): ComputedSignal<T> {
	return computed(getSelf, [input]) as ComputedSignal<T>;
}

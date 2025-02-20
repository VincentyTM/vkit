import isSignal from "./isSignal.js";
import type { Signal } from "./signal.js";

/**
 * Returns the current value of a signal or the input value itself if it is not a signal.
 * It is a shortcut for `isSignal(value) ? value.get() : value`.
 * @example
 * get("Something") === "Something"
 * get(signal("Something")) === "Something"
 * 
 * @param signalOrValue If it is a signal, the method returns its current value.
 * Otherwise, the method returns it without any change.
 * @returns The content of the input signal or the raw input value.
 */
export default function get<T>(signalOrValue: T | Signal<T>): T {
	return isSignal(signalOrValue) ? signalOrValue.get() : signalOrValue;
}

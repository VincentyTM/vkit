import { Signal, signalMap } from "./computed.js";
import { createSignalNode, SignalNode } from "./createSignalNode.js";
import { isSignal } from "./isSignal.js";
import { updateSignalValue, WritableSignal, writableSignalToString } from "./signal.js";
import { signalSubscribe } from "./signalSubscribe.js";
import { updateSignalNode } from "./updateSignalNode.js";

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
 * @param selectValue A pure function that describes how the signal's latest value is calculated from its parent.
 * @param updateValue A pure function that describes how the parent signal's value is updated.
 * @param key An optional parameter passed to `selectValue` and `updateValue`.
 * @returns A writable signal that contains the transformed value and delegates updates to its parent.
 */
export function deriveSignal<T, K, U>(
	parent: WritableSignal<T>,
	selectValue: (parentValue: T, currentKey: K) => U,
	updateValue: (parentValue: T, value: U, currentKey: K) => T,
	key: K | Signal<K>
): WritableSignal<U>;

export function deriveSignal<T, U>(
	parent: WritableSignal<T>,
	selectValue: (parentValue: T) => U,
	updateValue: (parentValue: T, value: U) => T
): WritableSignal<U>;

export function deriveSignal<T, K, U>(
	parent: WritableSignal<T>,
	selectValue: (parentValue: T, currentKey?: K) => U,
	updateValue: (parentValue: T, value: U, currentKey?: K) => T,
	key?: K | Signal<K>
): WritableSignal<U> {
	var node: SignalNode<U> = createSignalNode(selectValue, [parent, key]);

	function use(): U {
		return updateSignalNode(node, true);
	}

	use.isSignal = true;

	use.get = function(): U {
		return updateSignalNode(node, false);
	};

	use.map = signalMap;

	use.set = function(this: WritableSignal<U>, newValue: U): void {
		var parentValue = parent.get();
		var currentKey = isSignal(key) ? key.get() : key;
		var value = selectValue(parentValue, currentKey);

		if (value !== newValue) {
			var newParentValue = updateValue(parentValue, newValue, currentKey);
			parent.set(newParentValue);
			parent.get();

			if (isSignal(key)) {
				key.get();
			}
		}
	};
	
	use.subscribe = function(callback: (value: U) => void): () => void {
		return signalSubscribe(node, callback);
	};

	use.toString = writableSignalToString;
	use.update = updateSignalValue;

	return use as WritableSignal<U>;
}

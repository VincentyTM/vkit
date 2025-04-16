import { Signal, signalMap } from "./computed.js";
import { createSignalNode, SignalNode } from "./createSignalNode.js";
import { isSignal } from "./isSignal.js";
import { updateSignalValue, WritableSignal, writableSignalToString } from "./signal.js";
import { signalEffect } from "./signalEffect.js";
import { signalSubscribe } from "./signalSubscribe.js";
import { updateSignalNode } from "./updateSignalNode.js";
import { view } from "./view.js";
import { views } from "./views.js";

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
	var node: SignalNode<U> = createSignalNode(selectValue, [parent, key]);

	function use(): U {
		return updateSignalNode(node, true);
	}

	use.effect = signalEffect;
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
			var newParentValue = updateValue(parentValue, currentKey, newValue);
			parent.set(newParentValue);
			parent.get();
		}
	};
	
	use.subscribe = function(callback: (value: U) => void): () => void {
		return signalSubscribe(node, callback);
	};

	use.toString = writableSignalToString;
	use.update = updateSignalValue;
	use.view = view;
	use.views = views;

	return use as WritableSignal<U>;
}

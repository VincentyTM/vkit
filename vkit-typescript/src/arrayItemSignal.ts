import { Signal, signalMap } from "./computed.js";
import { createSignalNode, SignalNode } from "./createSignalNode.js";
import { isSignal } from "./isSignal.js";
import { updateSignalValue, writableSignalToString, WritableSignal } from "./signal.js";
import { updateSignalNode } from "./updateSignalNode.js";

/**
 * Creates a writable signal that acts as a proxy to a specific item in a parent array signal.
 * 
 * When the returned signal is set, the parent signal is assigned a new array with the changed item.
 * 
 * @example
 * const fruits = signal(["apple", "banana", "orange"]);
 * const currentFruitIndex = signal(1);
 * const currentFruit = arrayItemSignal(fruits, currentFruitIndex, "none");
 * 
 * currentFruit.set("strawberry");
 * 
 * console.log(fruits.get()); // ["apple", "strawberry", "orange"]
 * 
 * @param parent The source signal containing the array.
 * @param index The array index to track (can be a signal for dynamic indices).
 * @param defaultValue An optional fallback value used if the item at the index does not exist.
 * @returns A writable signal synchronized with the parent's array item.
 */
export function arrayItemSignal<T>(
	parent: WritableSignal<readonly T[]>,
	index: number | Signal<number>,
	defaultValue: T
): WritableSignal<T>;

export function arrayItemSignal<T>(
	parent: WritableSignal<readonly T[]>,
	index: number | Signal<number>,
): WritableSignal<T | undefined>;

export function arrayItemSignal<T>(
	parent: WritableSignal<readonly T[]>,
	index: number | Signal<number>,
	defaultValue?: T
): WritableSignal<T | undefined> {
	var node: SignalNode<T | undefined> = createSignalNode(selectValue, [parent, index]);

	function selectValue(state: readonly T[], index: number): T | undefined {
		return index in state ? state[index] : defaultValue;
	}

	function use(): T | undefined {
		return updateSignalNode(node, true);
	}

	use.isSignal = true;

	use.get = function(): T | undefined {
		return updateSignalNode(node, false);
	};

	use.map = signalMap;

	use.set = function(this: WritableSignal<T | undefined>, newValue: T): void {
		var parentValue = parent.get();
		var currentIndex = isSignal(index) ? index.get() : index;
		var value = selectValue(parentValue, currentIndex);

		if (value !== newValue) {
			var newParentValue = parentValue.slice();
			newParentValue[currentIndex] = newValue;
			parent.set(newParentValue);
			parent.get();

			if (isSignal(index)) {
				index.get();
			}
		}
	};

	use.toString = writableSignalToString;
	use.update = updateSignalValue;

	return use as WritableSignal<T | undefined>;
}

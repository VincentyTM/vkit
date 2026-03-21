import { Signal, signalMap } from "./computed.js";
import { createSignalNode, SignalNode } from "./createSignalNode.js";
import { isSignal } from "./isSignal.js";
import { objectAssign } from "./objectAssign.js";
import { updateSignalValue, writableSignalToString, WritableSignal } from "./signal.js";
import { updateSignalNode } from "./updateSignalNode.js";

/**
 * Creates a writable signal that acts as a proxy to a specific property of a parent signal.
 * 
 * When the returned signal is updated, it immutably updates the parent signal by
 * creating a new object reference with the changed property.
 * 
 * @example
 * interface Person {
 * 	firstName: string;
 * 	lastName: string;
 * 	age?: number;
 * }
 * 
 * const person = signal<Person>({
 * 	firstName: "John",
 * 	lastName: "Smith"
 * });
 * 
 * const firstName = propertySignal(person, "firstName");
 * const lastName = propertySignal(person, "lastName");
 * const age = propertySignal(person, "age", 42);
 * 
 * // Update person to { firstName: "John", lastName: "Smith", age: 43 }
 * age.set(43);
 * 
 * @param parent The source signal containing the object.
 * @param key The property key to track (can be a signal for dynamic keys).
 * @param defaultValue An optional fallback value used if the property is undefined.
 * @returns A writable signal synchronized with the parent's property.
 */
export function propertySignal<T, K extends keyof T>(
	parent: WritableSignal<T>,
	key: K | Signal<K>,
	defaultValue: Exclude<T[K], undefined>
): WritableSignal<Exclude<T[K], undefined>>;

export function propertySignal<T, K extends keyof T>(
	parent: WritableSignal<T>,
	key: K | Signal<K>,
): WritableSignal<T[K]>;

export function propertySignal<T, K extends keyof T>(
	parent: WritableSignal<T>,
	key: K | Signal<K>,
	defaultValue?: T[K]
): WritableSignal<T[K] | undefined> {
	var node: SignalNode<T[K] | undefined> = createSignalNode(selectValue, [parent, key]);

	function selectValue(state: T, key: K): T[K] | undefined {
		var current = state[key];
		return current === undefined ? defaultValue : current;
	}

	function use(): T[K] | undefined {
		return updateSignalNode(node, true);
	}

	use.isSignal = true;

	use.get = function(): T[K] | undefined {
		return updateSignalNode(node, false);
	};

	use.map = signalMap;

	use.set = function(this: WritableSignal<T[K] | undefined>, newValue: T[K]): void {
		var parentValue = parent.get();
		var currentKey = isSignal(key) ? key.get() : key;
		var value = selectValue(parentValue, currentKey);

		if (value !== newValue) {
			var newParentValue = objectAssign({}, parentValue);
			newParentValue[currentKey] = newValue;
			parent.set(newParentValue);
			parent.get();

			if (isSignal(key)) {
				key.get();
			}
		}
	};

	use.toString = writableSignalToString;
	use.update = updateSignalValue;

	return use as WritableSignal<T[K] | undefined>;
}

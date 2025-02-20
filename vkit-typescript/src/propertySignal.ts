import { computed } from "./computed.js";
import { get } from "./get.js";
import { objectAssign } from "./objectAssign.js";
import type { Signal, WritableSignal } from "./signal.js";
import { writable } from "./writable.js";

/**
 * Creates and returns a writable signal that reflects and updates a property of the current value of another writable signal.
 * In contrast to `objectProperty`, it maintains an immutable data structure and replaces the parent object instead of modifying it.
 * Writing a property signal is delayed until the next update, unlike a regular writable signal.
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
 * @param parent The signal that contains the object.
 * @param key The key of the property of the object. It may be a signal if it can change dynamically.
 * @param defaultValue An optional default value to replace undefined.
 * @returns A writable signal that contains the property's current value.
 */
export function propertySignal<P, K extends keyof P>(
	parent: WritableSignal<P>,
	key: K | Signal<K>,
	defaultValue: Exclude<P[K], undefined>
): WritableSignal<Exclude<P[K], undefined>>;

export function propertySignal<P, K extends keyof P>(
	parent: WritableSignal<P>,
	key: K | Signal<K>,
): WritableSignal<P[K]>;

export function propertySignal<P, K extends keyof P>(
	parent: WritableSignal<P>,
	key: K | Signal<K>,
	defaultValue?: P[K]
): WritableSignal<P[K] | undefined> {
	function selectValue(state: P, key: K): P[K] | undefined {
		var current = state[key];
		return current === undefined ? defaultValue : current;
	}

	function set(value: P[K]): void {
		var oldState = parent.get();
		var currentKey = get(key);
		var current = selectValue(oldState, currentKey);

		if (current !== value) {
			var newState = objectAssign({}, oldState);
			newState[currentKey] = value;
			parent.set(newState);
		}
	}

	var result = computed(selectValue, [parent, key]);
	return writable(result, set);
}

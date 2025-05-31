import { Signal, signalMap } from "./computed.js";
import { createSignalNode, SignalNode } from "./createSignalNode.js";
import { isSignal } from "./isSignal.js";
import { objectAssign } from "./objectAssign.js";
import { updateSignalValue, writableSignalToString, WritableSignal } from "./signal.js";
import { signalEffect } from "./signalEffect.js";
import { signalSubscribe } from "./signalSubscribe.js";
import { updateSignalNode } from "./updateSignalNode.js";
import { view } from "./view.js";
import { views } from "./views.js";

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

	use.effect = signalEffect;
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
	
	use.subscribe = function(callback: (value: T[K] | undefined) => void): () => void {
		return signalSubscribe(node, callback);
	};

	use.toString = writableSignalToString;
	use.update = updateSignalValue;
	use.view = view;
	use.views = views;
	
	return use as WritableSignal<T[K] | undefined>;
}

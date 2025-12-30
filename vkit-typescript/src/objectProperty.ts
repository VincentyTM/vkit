import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { getSnapshot } from "./getSnapshot.js";
import { isSignal } from "./isSignal.js";
import { observe } from "./observe.js";
import { onDestroy } from "./onDestroy.js";
import { signal, WritableSignal } from "./signal.js";

/**
 * Creates and returns a writable signal that reflects and updates a property of an object.
 * In contrast to `propertySignal`, it actually modifies the object's property instead of replacing the whole object in a signal.
 * @example
 * const person = {
 * 	firstName: "John",
 * 	lastName: "Smith"
 * };
 * 
 * const firstName = objectProperty(person, "firstName");
 * const lastName = objectProperty(person, "lastName");
 * 
 * @param object The object or a signal containing the current object.
 * @param property The key of the property or a signal containing the current key.
 * @returns A writable signal containing the current object's current property value.
 */
export function objectProperty<T, K extends keyof T>(
	object: T | Signal<T>,
	property: K | Signal<K>,
	getDefaultValue?: () => T[K]
): WritableSignal<T[K]> {
	var value = signal<T[K]>(getSnapshot(object)[getSnapshot(property)]);

	effect(function() {
		getSnapshot(object)[getSnapshot(property)] = value();
	});

	effect(function() {
		var o = isSignal(object) ? object() : object;
		var p = isSignal(property) ? property() : property;
		var change = observe(o, p);

		if (!change && getDefaultValue) {
			o[p] = getDefaultValue();
			change = observe(o, p);
		}

		if (!change) {
			throw new Error("Property '" + String(p) + "' does not exist and there is no default value provided");
		}

		onDestroy(change.subscribe(function(newValue: T[K]): void {
			value.set(newValue);
		}));

		value.set(o[p]);
	});

	return value;
}

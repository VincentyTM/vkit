import effect from "./effect.js";
import get from "./get.js";
import isSignal from "./isSignal.js";
import observe from "./observe.js";
import onUnmount from "./onUnmount.js";
import signal, {type Signal, type WritableSignal} from "./signal.js";

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
export default function objectProperty<T, K extends keyof T>(
	object: T | Signal<T>,
	property: K | Signal<K>,
	getDefaultValue?: () => T[K]
): WritableSignal<T[K]> {
	var value = signal<T[K]>(get(object)[get(property)]);
	var setEagerly = value.setEagerly;
	
	value.subscribe(function(v: T[K]) {
		get(object)[get(property)] = v;
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
		
		onUnmount(change.subscribe(setEagerly));
		setEagerly(o[p]);
	});
	
	return value;
}

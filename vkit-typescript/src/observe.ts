import { observable, Observable } from "./observable.js";

var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

/**
 * Observes a property of an object and returns an observable that fires when the property changes.
 * An object property can have multiple subscribers.
 * @example
 * const object = {count: 0};
 * const countChange = observe(object, "count");
 * 
 * if (countChange) {
 * 	countChange.subscribe((count) => console.log("Count is " + count));
 * }
 * 
 * object.count += 10;
 * object.count = 42;
 * 
 * @param object The object to be observed.
 * @param property The key of a property of the object.
 * @returns An observable that fires with the new value when the property changes or `null` if the subscription is unsuccessful.
 */
export function observe<T, K extends keyof T>(object: T, property: K): Observable<T[K]> | null {
	var desc = getOwnPropertyDescriptor(object, property);
	
	if (!desc) {
		return null;
	}
	
	if (desc.get && (desc.get as any).emitChange) {
		return (desc.get as any).emitChange as Observable<T[K]>;
	}
	
	var value = object[property];
	
	function get(): T[K] {
		return value;
	}
	
	var emitChange = get.emitChange = observable<T[K]>();
	
	defineProperty(object, property, {
		get: get,
		set: function(v: T[K]): void {
			if (value !== v) {
				value = v;
				emitChange(v);
			}
		}
	});
	
	return emitChange;
}

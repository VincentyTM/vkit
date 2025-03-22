import { getEffect } from "./contextGuard.js";
import { observe } from "./observe.js";
import { onDestroy } from "./onDestroy.js";
import { enqueueUpdate } from "./update.js";

function getValue<T, K extends keyof T>(object: T, property: K, _receiver: T): T[K] {
	var value = object[property];
	var effect = getEffect(true);
	
	if (!effect) {
		return value;
	}
	
	var observable = observe(object, property);
	
	if (!observable) {
		throw new ReferenceError("Property '" + String(property) + "' does not exist and there is no default value provided");
	}
	
	var enqueued = false;
	var render = effect.render;

	function set(newValue: T[K]): void {
		if (value !== newValue) {
			value = newValue;
			
			if (!enqueued) {
				enqueued = true;
				enqueueUpdate(updateOf);
			}
		}
	}
	
	function updateOf(): void {
		enqueued = false;
		render();
	}

	onDestroy(
		observable.subscribe(set)
	);
	
	return value;
}

var handler = {
	get: getValue
};

/**
 * Creates and returns a proxy which adds reactivity to an object's properties.
 * @example
 * const object = {count: 0};
 * const count = computed(() => of(object).count);
 * console.log(count.get()); // 0
 * 
 * ++object.count;
 * console.log(count.get()); // 0
 * 
 * update();
 * console.log(count.get()); // 1
 * 
 * @param object The object whose properties need to be observed.
 * @returns The proxy of the object.
 */
export function of<T extends object>(object: T): T;

export function of<T extends object, K extends keyof T>(object: T, property: K): T[K];

export function of<T extends object, K extends keyof T>(object: T, property?: K): T | T[K] {
	if (property !== undefined) {
		return getValue(object, property, object);
	}

	var effect = getEffect(true);
	
	if (!effect) {
		return object;
	}

	return new Proxy<T>(object, handler);
}

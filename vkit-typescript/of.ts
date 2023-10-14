import createSignal from "./signal";
import {getComponent} from "./contextGuard";
import observe from "./observe";
import onUnmount from "./onUnmount";

function getValue<ObjectType>(
	object: ObjectType,
	property: keyof ObjectType,
	_receiver: ObjectType
): ObjectType[keyof ObjectType] {
	var value = object[property];
	
	if (!getComponent(true)) {
		return value;
	}
	
	var observable = observe(object, property);
	
	if (!observable) {
		throw new ReferenceError("Property '" + String(property) + "' does not exist!");
	}
	
	var signal = createSignal(object[property]);
	
	onUnmount(
		observable.subscribe(signal.set)
	);
	
	return signal();
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
export default function of<ObjectType extends Object>(object: ObjectType) {
	return new Proxy<ObjectType>(object, handler);
}

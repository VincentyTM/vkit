import {enqueueUpdate} from "./update";
import {getComponent} from "./contextGuard";
import observe from "./observe";
import onUnmount from "./onUnmount";

function getValue<ObjectType>(
	object: ObjectType,
	property: keyof ObjectType,
	_receiver: ObjectType
): ObjectType[keyof ObjectType] {
	var value = object[property];
	var component = getComponent(true);
	
	if (!component) {
		return value;
	}
	
	var observable = observe(object, property);
	
	if (!observable) {
		throw new ReferenceError("Property '" + String(property) + "' does not exist!");
	}
	
	var enqueued = false;
	var render = component.render;

	function set(newValue: ObjectType[keyof ObjectType]): void {
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

	onUnmount(
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
export default function of<
	ObjectType extends Object,
	ObjectParamType extends ObjectType | null | undefined
>(object: ObjectParamType): ObjectParamType {
	if (!object) {
		return object;
	}

	return new Proxy<ObjectType>(object as ObjectType, handler) as never;
}

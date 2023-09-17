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

export default function of<ObjectType extends Object>(object: ObjectType) {
	return new Proxy<ObjectType>(object, handler);
}

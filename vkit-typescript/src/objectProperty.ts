import effect from "./effect.js";
import get from "./get.js";
import isSignal from "./isSignal.js";
import observe from "./observe.js";
import onUnmount from "./onUnmount.js";
import signal, {type Signal, type WritableSignal} from "./signal.js";

export default function objectProperty<ObjectType>(
	object: ObjectType | Signal<ObjectType>,
	property: keyof ObjectType | Signal<keyof ObjectType>
): WritableSignal<ObjectType[keyof ObjectType]> {
	var value = signal<ObjectType[keyof ObjectType]>(get(object)[get(property)]);
	var setEagerly = value.setEagerly;
	
	value.subscribe(function(v: ObjectType[keyof ObjectType]) {
		get(object)[get(property)] = v;
	});
	
	effect(function() {
		var o = isSignal(object) ? object() : object;
		var p = isSignal(property) ? property() : property;
		var change = observe(o, p);
		
		if (!change) {
			throw new Error("Property '" + String(p) + "' does not exist and there is no default value provided");
		}
		
		onUnmount(change.subscribe(setEagerly));
		setEagerly(o[p]);
	});
	
	return value;
}

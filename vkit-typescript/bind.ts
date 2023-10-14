import onEvent from "./onEvent";
import onUnmount from "./onUnmount";
import prop from "./prop";
import {Signal} from "./signal";

export type Bindings<T> = {
	[K in keyof T]?: (T[K] extends ((this: GlobalEventHandlers, ev: never) => any) | null
		? T[K]
		: T[K] | (() => T[K]) | Signal<T[K]> | Bindings<T[K]>
	)
};

export default function bind<Target>(
	target: Target,
	bindings: Bindings<Target>,
	persistent?: boolean
): void {
	for (var name in bindings) {
		var value = bindings[name];
		
		switch (typeof value) {
			case "object":
				if (!value) {
					(target as any)[name] = value;
				} else if ((value as any).prop) {
					(value as any).prop(name)(target);
				} else {
					var obj = target[name];
					
					if (obj) {
						bind(obj, value as any, persistent);
					} else {
						(target as any)[name] = value;
					}
				}
				break;
			case "function":
				if (name.indexOf("on") === 0) {
					var unsub = onEvent(target, name.substring(2), value);
					
					if (!persistent) {
						onUnmount(unsub);
					}
				} else {
					prop(name, value as () => unknown)(target);
				}
				break;
			case "undefined":
				break;
			default:
				(target as any)[name] = value;
		}
	}
}

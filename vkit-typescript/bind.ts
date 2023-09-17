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
	element: Target,
	bindings: Bindings<Target>,
	persistent?: boolean
): void {
	for (var name in bindings) {
		var value = bindings[name];
		
		switch (typeof value) {
			case "object":
				if (!value) {
					(element as any)[name] = value;
				} else if ((value as any).prop) {
					(value as any).prop(name)(element);
				} else {
					var obj = element[name];
					
					if (obj) {
						bind(obj, value as any, persistent);
					} else {
						(element as any)[name] = value;
					}
				}
				break;
			case "function":
				if (name.indexOf("on") === 0) {
					var unsub = onEvent(element, name.substring(2), value);
					
					if (!persistent) {
						onUnmount(unsub);
					}
				} else {
					prop(name, value as () => unknown)(element);
				}
				break;
			case "undefined":
				break;
			default:
				(element as any)[name] = value;
		}
	}
}

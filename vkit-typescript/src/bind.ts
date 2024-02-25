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

function setValue<Target>(
	target: Target,
	name: keyof Target,
	value: Target[keyof Target],
	persistent: boolean
) {
	if (!persistent) {
		var old = target[name];

		onUnmount(function() {
			if (target[name] === value) {
				target[name] = old;
			}
		});
	}

	target[name] = value;
}

/**
 * Binds some properties to a specific target.
 * @example
 * bind(document.body, {
 * 	className: "some-class",
 * 	style: {
 * 		backgroundColor: () => isDarkModeOn() ? "black" : "white",
 * 		color: () => isDarkModeOn() ? "white" : "black",
 * 		margin: "5em"
 * 	},
 * 	onclick() {
 * 		console.log("Clicked.");
 * 	}
 * });
 * @param target The target object.
 * @param bindings The properties given as key-value pairs.
 * For dynamic bindings, signals and functions can also be used as values.
 * If the key starts with "on", the value is attached as an event listener instead.
 * @param persistent If true, the attached event listeners are not removed when the current component unmounts.
 */
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
					setValue(target, name, value, !!persistent);
				} else if ((value as any).prop) {
					(value as any).prop(name)(target);
				} else {
					var obj = target[name];
					
					if (obj) {
						bind(obj, value as any, persistent);
					} else {
						setValue(target, name, value, !!persistent);
					}
				}
				break;
			case "function":
				if (name.indexOf("on") === 0) {
					var unsub = onEvent(target as never, name.substring(2), value as never);
					
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
				setValue(target, name, value, !!persistent);
		}
	}
}

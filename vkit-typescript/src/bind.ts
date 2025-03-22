import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { prop } from "./prop.js";
import { Signal } from "./signal.js";
import { signalProp } from "./signalProp.js";

type HTMLSelfClosingElement = (
	| HTMLAreaElement
	| HTMLBaseElement
	| HTMLBRElement
	| HTMLEmbedElement
	| HTMLHRElement
	| HTMLImageElement
	| HTMLInputElement
	| HTMLLinkElement
	| HTMLMetaElement
	| HTMLParamElement
	| HTMLSourceElement
	| HTMLTableColElement
	| HTMLTrackElement
);

type HTMLLeafElement = (
	| HTMLIFrameElement
	| HTMLSelfClosingElement
	| HTMLScriptElement
	| HTMLStyleElement
	| HTMLTemplateElement
	| HTMLTextAreaElement
);

type ExtendedEvent<E, T> = E & {
	readonly currentTarget: T;
	readonly target: E extends Event ? (
		T extends HTMLLeafElement ? T : E["target"]
	) : EventTarget;
};

export type Bindings<T> = {
	[K in keyof T]?: (
		T[K] extends ((this: GlobalEventHandlers, ev: infer EventType) => any) | null
		? (this: T, ev: ExtendedEvent<EventType, T>) => void
		: (T[K] | (() => T[K]) | Signal<T[K]> | Bindings<T[K]>)
	)
};

function setValue<T>(
	target: T,
	name: keyof T,
	value: T[keyof T],
	persistent: boolean
) {
	if (!persistent) {
		var old = target[name];

		onDestroy(function() {
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
 * @param persistent If true, the attached event listeners are not removed when the current reactive context is destroyed.
 */
export function bind<T>(
	target: T,
	bindings: Bindings<T>,
	persistent?: boolean
): void {
	for (var name in bindings) {
		var value = bindings[name];
		
		switch (typeof value) {
			case "object":
				if (!value) {
					setValue(target, name, value as never, !!persistent);
				} else if (isSignal(value)) {
					signalProp(target, name, value);
				} else {
					var obj = target[name];
					
					if (obj) {
						bind(obj, value as never, persistent);
					} else {
						setValue(target, name, value as never, !!persistent);
					}
				}
				break;
			case "function":
				if (name.indexOf("on") === 0) {
					var unsub = onEvent(target as never, name.substring(2), value as never);
					
					if (!persistent) {
						onDestroy(unsub);
					}
				} else {
					prop(name, value as () => unknown)(target);
				}
				break;
			case "undefined":
				break;
			default:
				setValue(target, name, value as never, !!persistent);
		}
	}
}

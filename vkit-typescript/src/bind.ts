import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";
import { onEvent } from "./onEvent.js";

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

type Binding<T, K extends keyof T> = T[K] extends ((this: GlobalEventHandlers, ev: infer EventType) => any) | null
	? (this: T, ev: ExtendedEvent<EventType, T>) => void
	: (T[K] | (() => T[K]) | Signal<T[K]> | Bindings<T[K]>);

export type Bindings<T> = {
	[K in keyof T]?: Binding<T, K>;
};

function prop<T>(
	target: T,
	name: keyof T,
	value: () => T[keyof T]
) {
	effect(function(): void {
		target[name] = value();
	});
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
export function bind<T>(target: T, bindings: Bindings<T>): void {
	for (var name in bindings) {
		var value = bindings[name];
		
		switch (typeof value) {
			case "object":
				if (!value) {
					target[name] = value as never;
				} else if (isSignal(value)) {
					prop(target, name, value as never);
				} else {
					var obj = target[name];
					
					if (obj) {
						bind(obj, value as never);
					} else {
						target[name] = value as never;
					}
				}
				break;
			case "function":
				if (name.indexOf("on") === 0) {
					onEvent(target as never, name.substring(2), value as never);
				} else {
					prop(target, name, value as never);
				}
				break;
			case "undefined":
				break;
			default:
				target[name] = value as never;
		}
	}
}

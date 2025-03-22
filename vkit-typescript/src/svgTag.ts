import { append } from "./append.js";
import { bind } from "./bind.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";
import { onEvent } from "./onEvent.js";
import { onUnmount } from "./onUnmount.js";
import { Signal } from "./signal.js";
import { Template } from "./Template.js";

type AttributeValue = string | null;
type Reactive<T> = T | Signal<T> | (() => T);
type ReactiveAttributeValue = Reactive<AttributeValue>;

type ExtendedEvent<E, T> = E & {
	readonly currentTarget: T;
	readonly target: E extends Event ? E["target"] : EventTarget;
};

type SVGAttributes = {
	[N: string]: any;
};

type SVGBindingsRecursive<T> = {
	[K in keyof T]?: Reactive<T[K]> | SVGBindingsRecursive<T[K]>;
};

type SVGBindings<T> = {
	[K in keyof T]?: (
		T[K] extends ((this: GlobalEventHandlers, ev: infer EventType) => any) | null ?
		(this: T, ev: ExtendedEvent<EventType, T>) => void :

		T[K] extends SVGAnimatedLength ?
		Reactive<string | number> :

		SVGBindingsRecursive<T[K]>
	);
} & SVGAttributes;

export type SVGView<ContextT = unknown> = (
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| ArrayLike<SVGView<ContextT>>
	| SVGBindings<ContextT>
	| Generator<SVGView<ContextT>, SVGView<ContextT>>
	| Signal<unknown>
	| ((element: ContextT) => void)
);

export type VirtualSVGElement<T> = {
	readonly arguments: Template<T>;
	readonly isVirtual: true;
	readonly nodeName: string;
	render(): T;
};

var xmlns = "http://www.w3.org/2000/svg";

function setAttribute(
	el: Element,
	name: string,
	value: string | null,
	persistent: boolean
): void {
	if (!persistent) {
		var old = el.getAttributeNS(null, name);

		onUnmount(function() {
			if (el.getAttributeNS(null, name) === value) {
				setAttribute(el, name, old, true);
			}
		});
	}
	
	if (value === null) {
		el.removeAttributeNS(null, name);
	} else {
		el.setAttributeNS(null, name, value);
	}
}

function bindAttribute(
	el: Element,
	name: string,
	value: ReactiveAttributeValue,
	persistent: boolean
): void {
	if (typeof value === "function") {
		if (isSignal(value)) {
			value.effect(function(v) {
				setAttribute(el, name, v, persistent);
			});
		} else if (name.indexOf("on") === 0) {
			var unsub = onEvent(el, name.substring(2), value);

			if (!persistent) {
				onUnmount(unsub);
			}
		} else {
			effect(function() {
				setAttribute(el, name, (value as () => AttributeValue)(), persistent);
			});
		}
	} else if (value && typeof value === "object") {
		bind((el as any)[name], value);
	} else {
		setAttribute(el, name, value, persistent);
	}
}

function bindAttributes(
	el: Element,
	attributes: {[attributeName: string]: ReactiveAttributeValue},
	persistent?: boolean
): void {
	for (var name in attributes) {
		bindAttribute(el, name, attributes[name], !!persistent);
	}
}

function renderElement<T extends Element>(this: VirtualSVGElement<T>): T {
	var el = document.createElementNS(xmlns, this.nodeName) as T;
	append<Template<typeof el>, typeof el>(el, arguments, el, bindAttributes as never);
	return el;
}

/**
 * Creates and returns an SVG tag (element factory).
 * SVG element names and attributes are case sensitive.
 * For a shorter syntax see `svgTags`.
 * @example
 * const Svg = svgTag("svg");
 * const Circle = svgTag("circle");
 * 
 * function Component() {
 * 	return Svg(
 * 		{
 * 			width: 100,
 * 			height: 100,
 * 			viewBox: "0 0 100 100"
 * 		},
 * 
 * 		Circle({
 * 			cx: 50,
 * 			cy: 50,
 * 			r: 50,
 * 			fill: "#ff0000"
 * 		})
 * 	);
 * }
 */
export function svgTag<N extends keyof SVGElementTagNameMap>(tagName: N): (
	...contents: SVGView<SVGElementTagNameMap[N]>[]
) => VirtualSVGElement<SVGElementTagNameMap[N]> {
	return function(): VirtualSVGElement<SVGElementTagNameMap[N]> {
		return {
			arguments: arguments as SVGView<SVGElementTagNameMap[N]>,
			isVirtual: true,
			nodeName: tagName,
			render: renderElement
		};
	};
}

import append from "./append.js";
import bind from "./bind.js";
import effect from "./effect.js";
import onEvent, {type EventTargetType} from "./onEvent.js";
import onUnmount from "./onUnmount.js";
import type {Signal} from "./signal.js";
import type {View} from "./view.js";

type AttributeValue = string | null;
type ReactiveAttributeValue = AttributeValue | Signal<AttributeValue> | (() => AttributeValue);

export type SVGAttributes<ElementType> = {
	[K in keyof ElementType]: ElementType[K] extends CSSStyleDeclaration | ((this: GlobalEventHandlers, ev: never) => any) | null
		? ElementType[K]
		: string | number;
};

var xmlns = "http://www.w3.org/2000/svg";

function setAttribute(
	el: Element,
	name: string,
	value: string | null,
	persistent: boolean
) {
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
) {
	if (typeof value === "function") {
		if ((value as Signal<AttributeValue>).effect) {
			(value as Signal<AttributeValue>).effect(function(v) {
				setAttribute(el, name, v, persistent);
			});
		} else if (name.indexOf("on") === 0) {
			var unsub = onEvent(el as unknown as EventTargetType, name.substring(2), value);

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
) {
	for (var name in attributes) {
		bindAttribute(el, name, attributes[name], !!persistent);
	}
}

export default function svgTag<K extends keyof SVGElementTagNameMap>(tagName: K): (
	...contents: View<SVGAttributes<SVGElementTagNameMap[K]>>[]
) => SVGElementTagNameMap[K] {
	return function(): SVGElementTagNameMap[K] {
		var el = document.createElementNS(xmlns, tagName);
		append<View<typeof el>, typeof el>(el, arguments, el, bindAttributes as never);
		return el as SVGElementTagNameMap[K];
	};
}

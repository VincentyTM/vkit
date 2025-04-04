import { append } from "./append.js";
import { bind } from "./bind.js";
import { ClientRenderer, deepPush } from "./deepPush.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { Reactive, SVGElementTemplate } from "./svgTag.js";

type AttributeValue = string | null;
type ReactiveAttributeValue = Reactive<AttributeValue>;

var xmlns = "http://www.w3.org/2000/svg";

export function clientRenderSVGElement<N extends keyof SVGElementTagNameMap>(
	clientRenderer: ClientRenderer<unknown>,
	template: SVGElementTemplate<N>
): void {
	var element = document.createElementNS(xmlns, template.tagName) as SVGElementTagNameMap[N];
	append(
		element,
		template.child,
		clientRenderer.parentEffect,
		bindAttributes as never
	);
	deepPush(clientRenderer, element);
}

function setAttribute(
	el: Element,
	name: string,
	value: string | null,
	persistent: boolean
): void {
	if (!persistent) {
		var old = el.getAttributeNS(null, name);

		onDestroy(function() {
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
				onDestroy(unsub);
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

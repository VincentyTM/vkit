import { AttributeTemplate, AttributeValue, ReactiveAttributeValue } from "./attribute.js";
import { createEffect } from "./createEffect.js";
import { ClientRenderer } from "./hydrate.js";
import { isSignal } from "./isSignal.js";
import { updateEffect } from "./updateEffect.js";

export function clientRenderAttribute<P extends Element>(
	clientRenderer: ClientRenderer<P>,
	template: AttributeTemplate
): void {
	var name = template.name;
	var value = template.value;

	addAttribute(clientRenderer, name, value);
}

function setAttribute(el: Element, name: string, value: AttributeValue, isSVG: boolean): void {
	if (value === true) {
		value = "";
	} else if (value === false) {
		value = null;
	}

	if (value === null) {
		if (isSVG) {
			el.removeAttributeNS(null, name);
		} else {
			el.removeAttribute(name);
		}
	} else {
		if (isSVG) {
			el.setAttributeNS(null, name, String(value));
		} else {
			el.setAttribute(name, String(value));
		}
	}
}

function addAttribute(clientRenderer: ClientRenderer<Element>, name: string, value: ReactiveAttributeValue): void {
	var el = clientRenderer.context;
	var isSVG = clientRenderer.isSVG;

	if (isSignal(value) || typeof value === "function") {
		var parentEffect = clientRenderer.parentEffect;

		var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
			setAttribute(el, name, value(), isSVG);
		});

		updateEffect(effect);
		return;
	}

	setAttribute(el, name, value, isSVG);
}

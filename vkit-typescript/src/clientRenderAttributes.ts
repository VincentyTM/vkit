import { AttributesTemplate, AttributeValue, ReactiveAttributeValue } from "./attributes.js";
import { effect } from "./effect.js";
import { ClientRenderer } from "./hydrate.js";
import { isSignal } from "./isSignal.js";

export function clientRenderAttributes<P extends Element>(
	clientRenderer: ClientRenderer<P>,
	template: AttributesTemplate
): void {
	var attributes = template.attributes;
	var isSVG = clientRenderer.isSVG;

	for (var name in attributes) {
		addAttribute(clientRenderer.context, name, attributes[name], isSVG);
	}
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

function addAttribute(el: Element, name: string, value: ReactiveAttributeValue, isSVG: boolean): void {
	if (isSignal(value)) {
		value.effect(function(val) {
			setAttribute(el, name, val, isSVG);
		});
		return;
	}
	
	if (typeof value === "function") {
		effect(function() {
			setAttribute(el, name, (value as () => AttributeValue)(), isSVG);
		});
		return;
	}

	setAttribute(el, name, value, isSVG);
}

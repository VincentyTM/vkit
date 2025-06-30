import { AttributeTemplate, AttributeValue, ReactiveAttributeValue } from "./attribute.js";
import { effect } from "./effect.js";
import { ClientRenderer } from "./hydrate.js";
import { isSignal } from "./isSignal.js";

export function clientRenderAttribute<P extends Element>(
	clientRenderer: ClientRenderer<P>,
	template: AttributeTemplate
): void {
	var name = template.name;
	var value = template.value;
	var isSVG = clientRenderer.isSVG;

	addAttribute(clientRenderer.context, name, value, isSVG);
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
	if (isSignal(value) || typeof value === "function") {
		effect(function() {
			setAttribute(el, name, value(), isSVG);
		});
		return;
	}

	setAttribute(el, name, value, isSVG);
}

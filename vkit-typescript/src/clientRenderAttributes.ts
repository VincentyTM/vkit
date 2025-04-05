import { AttributesTemplate, AttributeValue, ReactiveAttributeValue } from "./attributes.js";
import { ClientRendererBase } from "./deepPush.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";

export function clientRenderAttributes<P extends Element>(
	clientRenderer: ClientRendererBase<P>,
	template: AttributesTemplate
): void {
	var attributes = template.attributes;

	for (var name in attributes) {
		addAttribute(clientRenderer.context, name, attributes[name]);
	}
}

function setAttribute(el: Element, name: string, value: AttributeValue): void {
	if (typeof value === "number") {
		value = value.toString();
	}
	
	if (typeof value === "string") {
		el.setAttribute(name, value);
		return;
	}
	
	if (value) {
		el.setAttribute(name, "");
		return;
	}

	el.removeAttribute(name);
}

function addAttribute(el: Element, name: string, value: ReactiveAttributeValue): void {
	if (typeof value === "number") {
		value = value.toString();
	}
	
	if (typeof value === "string") {
		el.setAttribute(name, value);
		return;
	}
	
	if (isSignal(value)) {
		value.effect(function(val) {
			setAttribute(el, name, val);
		});
		return;
	}
	
	if (typeof value === "function") {
		effect(function() {
			setAttribute(el, name, (value as () => AttributeValue)());
		});
		return;
	}
	
	if (value) {
		el.setAttribute(name, "");
		return;
	}

	el.removeAttribute(name);
}

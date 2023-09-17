import effect from "./effect";
import {Signal} from "./signal";

type Attributes = {
	[attributeName: string]: ReactiveAttributeValue
};

type AttributeValue = string | number | boolean;

type ReactiveAttributeValue = AttributeValue | Signal<AttributeValue> | (() => AttributeValue);

function setAttribute(el: HTMLElement, name: string, value: AttributeValue): void {
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

function addAttribute(el: HTMLElement, name: string, value: ReactiveAttributeValue): void {
	if (typeof value === "number") {
		value = value.toString();
	}
	
	if (typeof value === "string") {
		el.setAttribute(name, value);
		return;
	}
	
	if (value && typeof (value as Signal<AttributeValue>).effect === "function") {
		(value as Signal<AttributeValue>).effect(function(val) {
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

export default function bindAttributes(attributes: Attributes): (element: HTMLElement) => void {
	return function(element: HTMLElement) {
		for (var name in attributes) {
			addAttribute(element, name, attributes[name]);
		}
	};
}

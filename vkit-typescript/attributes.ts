import effect from "./effect";
import {Signal} from "./signal";

type AttributeValue = string | number | boolean;
type ReactiveAttributeValue = AttributeValue | Signal<AttributeValue> | (() => AttributeValue);

function setAttribute(el: HTMLElement, name: string, value: AttributeValue) {
	if (typeof value === "number") {
		value = value.toString();
	}
	
	if (typeof value === "string") {
		el.setAttribute(name, value);
	} else if (value) {
		el.setAttribute(name, "");
	} else {
		el.removeAttribute(name);
	}
}

function addAttribute(el: HTMLElement, name: string, value: ReactiveAttributeValue) {
	if (typeof value === "number") {
		value = value.toString();
	}
	
	if (typeof value === "string") {
		el.setAttribute(name, value);
	} else if (value && typeof (value as Signal<AttributeValue>).effect === "function") {
		(value as Signal<AttributeValue>).effect(function(val) {
			setAttribute(el, name, val);
		});
	} else if (typeof value === "function") {
		effect(function() {
			setAttribute(el, name, (value as () => AttributeValue)());
		});
	} else if (value) {
		el.setAttribute(name, "");
	} else {
		el.removeAttribute(name);
	}
}

function bindAttributes(attributes: {[attributeName: string]: ReactiveAttributeValue}) {
	return function(element: HTMLElement) {
		for (var name in attributes) {
			addAttribute(element, name, attributes[name]);
		}
	};
}

export default bindAttributes;

import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";

type Attributes = {
	[attributeName: string]: ReactiveAttributeValue
};

type AttributeValue = string | number | boolean;

type ReactiveAttributeValue = AttributeValue | Signal<AttributeValue> | (() => AttributeValue);

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

/**
 * Creates a binding for attributes which can be applied on one or more elements.
 * @example
 * Div(
 * 	attributes({
 * 		"my-attribute": "Static binding",
 * 		"my-attribute-2": () => "Dynamic binding with a function",
 * 		"my-attribute-3": computed(() => "Dynamic binding with a signal")
 * 	})
 * )
 * @param attributes An object which contains attributes as key-value pairs.
 * The keys are the attribute names and the values are the attribute values.
 * 
 * The attributes values can be given as strings, functions returning strings or signals containing strings.
 * In order to remove an attribute, you can specify null instead of a string.
 * You can also use boolean or numeric values which are converted to string or null values.
 * True is converted to an empty string, while false means the attribute should be removed (similarly to null).
 * @returns A function directive which can be added to an element.
 */
export function attributes(attributes: Attributes): (element: Element) => void {
	return function(element: Element): void {
		for (var name in attributes) {
			addAttribute(element, name, attributes[name]);
		}
	};
}

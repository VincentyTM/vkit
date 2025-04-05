import { clientRenderAttributes } from "./clientRenderAttributes.js";
import { Signal } from "./computed.js";
import { serverRenderAttributes } from "./serverRenderAttributes.js";
import { CustomTemplate } from "./Template.js";

export interface AttributesTemplate extends CustomTemplate<Element> {
	attributes: Record<string, AttributeValue | Signal<AttributeValue> | (() => AttributeValue)>;
}

type Attributes = {
	[attributeName: string]: ReactiveAttributeValue
};

export type AttributeValue = string | number | boolean | null;

export type ReactiveAttributeValue = AttributeValue | Signal<AttributeValue> | (() => AttributeValue);

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
export function attributes(attributes: Attributes): AttributesTemplate {
	return {
		attributes: attributes,
		hydrate: clientRenderAttributes,
		serverRender: serverRenderAttributes
	};
}

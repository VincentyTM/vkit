import { clientRenderAttribute } from "./clientRenderAttribute.js";
import { Signal } from "./computed.js";
import { serverRenderAttribute } from "./serverRenderAttribute.js";
import { CustomTemplate } from "./Template.js";

export interface AttributeTemplate extends CustomTemplate<Element> {
	readonly name: string;
	readonly value: ReactiveAttributeValue;
}

export type AttributeValue = string | number | bigint | boolean | null;

export type ReactiveAttributeValue = AttributeValue | Signal<AttributeValue> | (() => AttributeValue);

/**
 * Creates a binding for an attribute which can be applied on one or more elements.
 * @example
 * Div(
 * 	attribute("my-attribute", "Static binding"),
 * 	attribute("my-attribute-2", () => "Dynamic binding with a function"),
 * 	attribute("my-attribute-3", computed(() => "Dynamic binding with a signal")
 * )
 * @param name The name of the attribute.
 * @param value The value of the attribute.
 * 
 * The attribute value can be given as a string, a function returning a string or a signal containing a string.
 * In order to remove an attribute, you can specify null instead of a string.
 * You can also use boolean or numeric values which are converted to string or null values.
 * True is converted to an empty string, while false means the attribute should be removed (similarly to null).
 * @returns A template that controls the existence and the value of an attribute on an element.
 */
export function attribute(name: string, value: ReactiveAttributeValue): AttributeTemplate {
	return {
		name: name,
		value: value,
		hydrate: clientRenderAttribute,
		serverRender: serverRenderAttribute
	};
}

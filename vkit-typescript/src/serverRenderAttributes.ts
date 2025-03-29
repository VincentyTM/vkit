import { AttributesTemplate } from "./attributes.js";
import { ServerElement } from "./createServerElement.js";

export function serverRenderAttributes(
	serverElement: ServerElement,
	template: AttributesTemplate
): void {
	var attributes = template.attributes;

	for (var name in attributes) {
		var rawValue = attributes[name];
		var value = typeof rawValue === "function" ? rawValue() : rawValue;
	
		if (value === true) {
			value = "";
		} else if (value === false) {
			value = null;
		}
	
		if (value === null) {
			delete serverElement.attributes[name];
		} else {
			serverElement.attributes[name] = String(value);
		}
	}
}

import { AttributeTemplate } from "./attribute.js";
import { ServerElement } from "./createServerElement.js";

export function serverRenderAttribute(
	serverElement: ServerElement,
	template: AttributeTemplate
): void {
	var name = template.name;
	var rawValue = template.value;
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

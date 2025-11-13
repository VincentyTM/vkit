import { toKebabCase } from "./toKebabCase.js";

export type ServerNode = ServerElement | ServerRawHTMLSource | string | null;

export interface ServerElement {
	readonly attributes: Record<string, string>;
	readonly children: ServerNode[] | null;
	readonly styleProps: Record<string, string>;
	readonly tagName: string;
	readonly tagNameLower: string;
}

export interface ServerRawHTMLSource {
	readonly text: string;
}

var selfClosingTags = {
	area: 1,
	base: 1,
	br: 1,
	col: 1,
	embed: 1,
	hr: 1,
	img: 1,
	input: 1,
	link: 1,
	meta: 1,
	param: 1,
	source: 1,
	track: 1,
	wbr: 1
} as const;

export function createServerElement(tagName: string): ServerElement {
	var tagNameLower = tagName.toLowerCase();

	return {
		attributes: {},
		children: tagNameLower in selfClosingTags ? null : [],
		styleProps: {},
		tagName: tagName,
		tagNameLower: tagNameLower
	};
}

function propToAttr(name: string): string {
	if (name === "className") {
		return "class";
	}

	if (name === "defaultValue") {
		return "value";
	}

	if (name === "htmlFor") {
		return "for";
	}

	if (name.indexOf("aria") === 0) {
		return toKebabCase(name);
	}
	
	return name.toLowerCase();
}

export function appendChild(element: ServerElement, child: ServerNode): void {
	var children = element.children;

	if (children) {
		children.push(child);
	}
}

export function getAttribute(element: ServerElement, name: string): string | null {
	var attributes = element.attributes;

	return name in attributes ? attributes[name] : null;
}

export function getInnerText(element: ServerElement): string {
	var children = element.children;

	if (!children) {
		return "";
	}

	var parts: string[] = [];
	var n = children.length;
	
	for (var i = 0; i < n; ++i) {
		var child = children[i];
		
		if (typeof child === "string") {
			parts.push(child);
		} else if (child) {
			if ("tagName" in child) {
				parts.push(getInnerText(child));
			} else {
				parts.push(child.text);
			}
		}
	}
	
	return parts.join("");
}

export function getProperty(element: ServerElement, name: string): string | null {
	return getAttribute(element, propToAttr(name));
}

export function hasAttribute(element: ServerElement, name: string): boolean {
	return name in element.attributes;
}

export function removeAttribute(element: ServerElement, name: string): void {
	delete element.attributes[name];
}

export function setAttribute(element: ServerElement, name: string, value: string): void {
	element.attributes[name] = value;
}

export function setProperty(element: ServerElement, name: string, value: unknown): void {
	if (typeof value === "boolean") {
		if (value) {
			element.attributes[propToAttr(name)] = "";
		} else {
			delete element.attributes[propToAttr(name)];
		}
		return;
	}
	
	if (typeof value === "string") {
		if (name === "value" && element.tagNameLower === "textarea") {
			appendChild(element, value);
		} else {
			element.attributes[propToAttr(name)] = value;
		}
		return;
	}
	
	if (typeof value === "number") {
		if (name === "value" && element.tagNameLower === "textarea") {
			appendChild(element, String(value));
		} else {
			element.attributes[propToAttr(name)] = String(value);
		}
		return;
	}
}

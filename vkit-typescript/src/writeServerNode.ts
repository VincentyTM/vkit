import { getInnerText, getProperty, setProperty, ServerNode, ServerElement } from "./createServerElement.js";
import { escapeHTML } from "./escapeHTML.js";
import { StreamWriter } from "./StreamWriter.js";

export function writeServerNode(res: StreamWriter, node: ServerNode): void {
	if (typeof node === "string") {
		writeEscapedText(res, node);
	} else if (node) {
		if ("tagName" in node) {
			writeElement(res, node);
		} else {
			res.write(node.text);
		}
	}
}

function tagReplacer(text: string): string {
	return "<\\/" + text.substring(2);
}

function writeDefaultElementChildren(res: StreamWriter, children: ServerNode[]): void {
	var n = children.length;

	for (var i = 0; i < n; ++i) {
		writeServerNode(res, children[i]);
	}
}

function writeElement(res: StreamWriter, element: ServerElement): void {
	var attributes = element.attributes;
	var tagName = element.tagName;
	var tagNameLower = element.tagNameLower;
	var children = element.children;

	res.write('<');
	res.write(tagName);

	for (var name in attributes) {
		if (name === "value" && tagNameLower === "select") {
			continue;
		}

		res.write(' ');
		res.write(escapeHTML(name));

		if (attributes[name]) {
			res.write('="');
			res.write(escapeHTML(attributes[name]));
			res.write('"');
		}
	}

	writeStyleAttribute(res, element.styleProps);

	res.write('>');

	if (children) {
		switch (tagNameLower) {
			case "script": writeScriptChildren(res, children); break;
			case "style": writeStyleChildren(res, children); break;
			case "textarea": writeTextareaChildren(res, children); break;
			case "select": writeSelectChildren(res, children, attributes); break;
			default: writeDefaultElementChildren(res, children);
		}

		res.write('</');
		res.write(tagName);
		res.write('>');
	}
}

function writeEscapedText(res: StreamWriter, value: string): void {
	res.write(escapeHTML(value));
}

function writeScriptChildren(res: StreamWriter, children: ServerNode[]): void {
	var n = children.length;

	for (var i = 0; i < n; ++i) {
		var text = children[i];

		if (typeof text !== "string") {
			throw new Error("Only text nodes are allowed in script elements");
		}

		res.write(text.replace(/<\/script\b/ig, tagReplacer));
	}
}

function writeSelectChildren(
	res: StreamWriter,
	children: ServerNode[],
	attributes: Record<string, string>
): void {
	var n = children.length;

	for (var i = 0; i < n; ++i) {
		var child = children[i];

		if (typeof child === "string") {
			writeEscapedText(res, child);
		} else if (child) {
			if ("tagName" in child) {
				if (
					"value" in attributes &&
					child.tagNameLower === "option" &&
					(
						getProperty(child, "value") ||
						getProperty(child, "label") ||
						getInnerText(child) ||
						""
					) === attributes.value
				) {
					setProperty(child, "selected", true);
				}

				writeElement(res, child);
			} else {
				res.write(child.text);
			}
		}
	}
}

function writeStyleChildren(res: StreamWriter, children: ServerNode[]): void {
	var n = children.length;

	for (var i = 0; i < n; ++i) {
		var text = children[i];

		if (typeof text !== "string") {
			throw new Error("Only text nodes are allowed in style elements");
		}

		res.write(text.replace(/<\/style\b/ig, tagReplacer));
	}
}

function writeTextareaChildren(res: StreamWriter, children: ServerNode[]): void {
	var n = children.length;

	for (var i = 0; i < n; ++i) {
		var text = children[i];

		if (typeof text !== "string") {
			throw new Error("Only text nodes are allowed in textarea elements");
		}

		writeEscapedText(res, text);
	}
}

function writeStyleAttribute(res: StreamWriter, styleProps: Record<string, string>): void {
	var noStyleProps = true;

	for (var name in styleProps) {
		noStyleProps = false;
		res.write(' style="');
		break;
	}

	for (var name in styleProps) {
		res.write(escapeHTML(name));
		res.write(':');
		res.write(escapeHTML(styleProps[name]));
		res.write(';');
	}

	if (!noStyleProps) {
		res.write('"');
	}
}

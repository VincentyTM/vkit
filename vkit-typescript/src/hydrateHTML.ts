import { HydrationPointer } from "./hydrate.js";
import { HTMLTemplate } from "./html.js";
import { hydrate } from "./hydrate.js";
import { Template } from "./Template.js";

function findNodes(
	result: Node[],
	container: Node,
	type: number,
	value: string,
	count: number
): number {
	if (container.nodeType === type && container.nodeValue === value) {
		result.push(container);
		--count;
	}

	for (var child = container.firstChild; 0 < count && child; child = child.nextSibling) {
		count = findNodes(result, child, type, value, count);
	}

	return count;
}

export function hydrateHTML<P extends HTMLElement>(pointer: HydrationPointer<P>, template: HTMLTemplate<P>): void {
	var args = template.args;
	var operators: Template<P>[] = [];
	var placeholder = "<!---->";
	var result: (string | number | bigint)[] = [];
	var l = args.length;

	for (var i = 0; i < l; ++i) {
		var arg = args[i];

		if (arg === null || arg === undefined) {
			continue;
		}

		if (typeof arg === "string") {
			result.push(arg);

			if (l > 1) {
				var index = arg.indexOf(placeholder);

				while (index !== -1) {
					operators.push(document.createComment(""));
					index = arg.indexOf(placeholder, index + placeholder.length);
				}
			}
		} else if (typeof arg === "number" || typeof arg === "bigint") {
			result.push(arg);
		} else if (typeof arg === "function" || typeof arg === "object") {
			result.push(placeholder);
			operators.push(arg);
		}
	}

	var cTag = "div";
	var content = result.join("");
	var tagMatch = content.match(/<[a-zA-Z0-9\-]+/);

	if (tagMatch && tagMatch.length) {
		var firstTag = tagMatch[0].substring(1).toLowerCase();

		switch (firstTag) {
			case "th":
			case "td":
				cTag = "tr"; break;
			case "tr":
				cTag = "tbody"; break;
			case "tbody":
			case "thead":
			case "tfoot":
			case "caption":
				cTag = "table"; break;
			case "body":
			case "head":
				cTag = "html"; break;
		}
	}

	var container = document.createElement(cTag);
	container.innerHTML = content;

	var n = operators.length;

	if (n > 0) {
		var comments: Comment[] = [];

		findNodes(comments, container, 8, "", n);

		for (i = 0; i < n; ++i) {
			var operator = operators[i];
			var comment = comments[i];

			if (!comment) {
				throw new Error("Some object or function could not be inserted");
			}

			var context: Node | null = comment.previousElementSibling;

			if (context === undefined) {
				context = comment;

				while (context = context.previousSibling) {
					if (context.nodeType === 1) {
						break;
					}
				}
			}

			if (context === null) {
				context = comment.parentNode;
			}

			if (context === container) {
				context = null;
			}

			hydrate({
				context: comment.parentNode!,
				currentNode: comment,
				isSVG: false,
				parentEffect: pointer.parentEffect,
				stopNode: comment
			}, operator as Template<ParentNode>);

			comment.parentNode!.removeChild(comment);
		}
	}

	hydrate(pointer, Array.prototype.slice.call(container.childNodes));
}

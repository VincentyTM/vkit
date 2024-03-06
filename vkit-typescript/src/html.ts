import insert from "./insert.js";
import isArray from "./isArray.js";
import toArray from "./toArray.js";
import type {View} from "./view.js";

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

/**
 * Parses the HTML text from the template literal and returns an array of DOM nodes.
 * Escapes template literal expressions.
 * @example
 * html`
 * 	<h1>Hello ${name}</h1>
 * 	<div>
 * 		${{className: "a-class-on-the-div"}}
 * 		${SomeOtherComponent()}
 * 		<input>
 * 		${{value: "The value of the input"}}
 * 	</div>
 * `
 * @returns An array of DOM nodes.
 */
export default function html(
	strings: ArrayLike<string> & {
		raw: ArrayLike<string>
	},
	...expressions: View[]
): View[];

export default function html(
	strings: ArrayLike<string> & {
		raw: ArrayLike<string>
	}
): View[] {
	if (isArray(strings) && isArray((strings as any).raw)) {
		var n = strings.length;
		var a = new Array(2*n - 1);
		
		if (n > 0) {
			a[0] = strings[0];
		}
		
		for (var i = 1, j = 1; i < n; ++i) {
			var arg = arguments[i];
			a[j++] = typeof arg === "string" ? [arg] : arg;
			a[j++] = strings[i];
		}
		
		return html.apply(null, a as any);
	}
	
	var operators: Comment[] = [];
	var placeholder = "<!---->";
	var result: any = [];
	
	for (var i = 0, l = arguments.length; i < l; ++i) {
		var arg = arguments[i];
		
		if (arg === null || arg === undefined) {
			continue;
		}
		
		var type = typeof arg;
		
		if (type === "string") {
			result.push(arg);
			
			if (l > 1) {
				var index = arg.indexOf(placeholder);
				
				while (index !== -1) {
					operators.push(document.createComment(""));
					index = arg.indexOf(placeholder, index + placeholder.length);
				}
			}
		} else if (type === "number" || type === "bigint") {
			result.push(arg);
		} else if (type === "function" || type === "object") {
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
	if (n) {
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
			
			if (!context) {
				context = comment.parentNode;
			}
			
			if (context === container) {
				context = null;
			}
			
			insert(operator, comment, context as any);
			comment.parentNode!.removeChild(comment);
		}
	}
	
	return toArray(container.childNodes);
}

import { hydrateHTML } from "./hydrateHTML.js";
import { isArray } from "./isArray.js";
import { serverRenderHTML } from "./serverRenderHTML.js";
import { CustomTemplate, Template } from "./Template.js";

export interface HTMLTemplate<P> extends CustomTemplate<P> {
	args: ArrayLike<Template<P>>;
}

/**
 * Parses the HTML text from the template literal and returns a template.
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
 * @returns A template that represents the parsed HTML elements and other nodes.
 */
 export function html<P extends HTMLElement>(
	...expressions: Template<P>[]
): HTMLTemplate<P>;

export function html<P extends HTMLElement>(
	strings: ArrayLike<string> & {
		raw: ArrayLike<string>
	},
	...expressions: Template<P>[]
): HTMLTemplate<P>;

export function html<P extends HTMLElement>(
	strings: (ArrayLike<string> & {
		raw: ArrayLike<string>
	}) | Template<P>
): HTMLTemplate<P> {
	if (isArray(strings) && isArray((strings as any).raw)) {
		var n = strings.length;
		var a = new Array(2 * n - 1);
		
		if (n > 0) {
			a[0] = strings[0];
		}
		
		for (var i = 1, j = 1; i < n; ++i) {
			var arg = arguments[i];
			a[j++] = typeof arg === "string" ? [arg] : arg;
			a[j++] = strings[i];
		}
		
		return html.apply(null, a as any) as HTMLTemplate<P>;
	}

	return {
		args: arguments,
		hydrate: hydrateHTML,
		serverRender: serverRenderHTML
	};
}

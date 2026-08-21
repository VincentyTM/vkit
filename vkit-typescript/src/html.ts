import { hydrateHTML } from "./hydrateHTML.js";
import { isArray } from "./isArray.js";
import { serverRenderHTML } from "./serverRenderHTML.js";
import { CustomTemplate, Template } from "./Template.js";

export interface HTMLLiteralTemplate extends CustomTemplate<unknown> {
	args: ArrayLike<Template<never>>;
}

/**
 * Parses the HTML text from the template literal and returns a template.
 * Escapes template literal expressions.
 * @example
 * html`
 * 	<h1>Hello ${name}</h1>
 * 	<div>
 * 		${SomeOtherComponent()}
 * 	</div>
 * `
 * @returns A template that represents the parsed HTML elements and other nodes.
 */
export function html(
	...expressions: Template<never>[]
): HTMLLiteralTemplate;

export function html(
	strings: ArrayLike<string> & {
		raw: ArrayLike<string>
	},
	...expressions: Template<never>[]
): HTMLLiteralTemplate;

export function html(
	strings: (ArrayLike<string> & {
		raw: ArrayLike<string>
	}) | Template<never>
): HTMLLiteralTemplate {
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

		return html.apply(null, a as any) as HTMLLiteralTemplate;
	}

	return {
		args: arguments,
		hydrate: hydrateHTML,
		serverRender: serverRenderHTML
	};
}

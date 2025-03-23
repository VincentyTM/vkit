import { clientRenderHTMLElement } from "./clientRenderHTMLElement.js";
import { CustomTemplate, Template } from "./Template.js";

export interface HTMLElementTemplate<N extends keyof HTMLElementTagNameMap> extends CustomTemplate<HTMLElementTagNameMap[N]> {
	readonly child: Template<HTMLElementTagNameMap[N]>;
	readonly tagName: N;
}

/**
 * Creates and returns an HTML tag (element factory).
 * In order to create a custom HTML element, you may use underscores instead of dashes.
 * For a shorter syntax see `htmlTags`.
 * @example
 * const Button = htmlTag("button");
 * const H1 = htmlTag("h1");
 * const Input = htmlTag("input");
 * const My_Custom_Element = htmlTag("my-custom-element");
 * 
 * function Component() {
 * 	return My_Custom_Element(
 * 		H1("Hello world", {
 * 			style: {
 * 				color: "red"
 * 			}
 * 		}),
 * 		Input({
 * 			readOnly: true,
 * 			value: "A read-only input field"
 * 		}),
 * 		Button("Click here", {
 * 			onclick() {
 * 				console.log("A clickable button!");
 * 			}
 * 		})
 * 	);
 * }
 */
export function htmlTag<N extends keyof HTMLElementTagNameMap>(tagName: N): (
	...contents: Template<HTMLElementTagNameMap[N]>[]
) => HTMLElementTemplate<N> {
	return function(): HTMLElementTemplate<N> {
		return {
			child: arguments as Template<HTMLElementTagNameMap[N]>,
			tagName: tagName,
			clientRender: clientRenderHTMLElement
		};
	};
}

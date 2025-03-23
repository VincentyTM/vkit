import { append } from "./append.js";
import { bind } from "./bind.js";
import { deepPush, Pushable } from "./deepPush.js";
import { Template } from "./Template.js";

export type VirtualHTMLElement<T> = {
	readonly arguments: Template<T>;
	readonly isVirtual: true;
	readonly nodeName: string;
	clientRender(
		array: Pushable<T>,
		template: VirtualHTMLElement<T>,
		context: unknown,
		crossView: boolean
	): void;
};

function clientRenderHTMLElement<T extends HTMLElement>(
	array: Pushable<T>,
	template: VirtualHTMLElement<T>,
	context: unknown,
	crossView: boolean
): void {
	var element = document.createElement(template.nodeName) as T;
	append(element, template.arguments, element, bind);
	deepPush(array, element, context, bind, crossView);
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
) => VirtualHTMLElement<HTMLElementTagNameMap[N]> {
	return function(): VirtualHTMLElement<HTMLElementTagNameMap[N]> {
		return {
			arguments: arguments as Template<HTMLElementTagNameMap[N]>,
			isVirtual: true,
			nodeName: tagName.toUpperCase(),
			clientRender: clientRenderHTMLElement
		};
	};
}

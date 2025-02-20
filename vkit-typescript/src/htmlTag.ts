import { append } from "./append.js";
import { bind } from "./bind.js";
import type { Template } from "./Template.js";

export type VirtualHTMLElement<T> = {
	readonly arguments: Template<T>;
	readonly isVirtual: true;
	readonly nodeName: string;
	render(): T;
};

function renderElement<T extends HTMLElement>(this: VirtualHTMLElement<T>): T {
	var el = document.createElement(this.nodeName) as T;
	append(el, this.arguments, el, bind);
	return el;
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
			render: renderElement
		};
	};
}

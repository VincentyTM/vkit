import append from "./append.js";
import bind from "./bind.js";
import type {View} from "./view.js";

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
export default function htmlTag<K extends keyof HTMLElementTagNameMap>(tagName: K): (
	...contents: View<HTMLElementTagNameMap[K]>[]
) => HTMLElementTagNameMap[K] {
	return function(): HTMLElementTagNameMap[K] {
		var el = document.createElement(tagName);
		append<View<typeof el>, typeof el>(el, arguments, el, bind);
		return el;
	};
}

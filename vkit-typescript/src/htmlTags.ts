import htmlTag from "./htmlTag.js";
import type { View } from "./view.js";

type HTMLProxy = {
	[K in Capitalize<keyof HTMLElementTagNameMap>]: (...contents: View<HTMLElementTagNameMap[Lowercase<K>]>[]) => HTMLElementTagNameMap[Lowercase<K>];
} & {
	[K: string]: (...contents: View<HTMLElement>[]) => HTMLElement;
};

/**
 * Contains all HTML tags (element factories).
 * In order to create a custom HTML element, you may use underscores instead of dashes.
 * In case you want to avoid using proxies, see `htmlTag`.
 * @example
 * const {Button, H1, Input, My_Custom_Element} = htmlTags;
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
var htmlTags = new Proxy<HTMLProxy>({} as never, {
	get: function(_target: HTMLProxy, tagName: string, _receiver: HTMLProxy) {
		return htmlTag(tagName.toLowerCase().replace(/_/g, "-") as keyof HTMLElementTagNameMap);
	}
});

export default htmlTags;

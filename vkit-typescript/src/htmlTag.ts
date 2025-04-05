import { hydrateHTMLElement } from "./hydrateHTMLElement.js";
import { serverRenderHTMLElement } from "./serverRenderHTMLElement.js";
import { CustomTemplate, Template } from "./Template.js";

export interface HTMLElementTemplate<N extends keyof HTMLElementTagNameMap> extends CustomTemplate<unknown> {
	readonly child: Template<HTMLElementTagNameMap[N]>;
	readonly tagName: N;
}

/**
 * Creates and returns an HTML tag (element factory).
 * For a shorter syntax see `htmlTags`.
 * @example
 * const Button = htmlTag("button");
 * const Div = htmlTag("div");
 * const H1 = htmlTag("h1");
 * const Input = htmlTag("input");
 * 
 * function Component() {
 * 	return Div(
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
export function htmlTag<N extends keyof HTMLElementTagNameMap>(tagName: N): (...children: Template<HTMLElementTagNameMap[N]>[]) => HTMLElementTemplate<N>;

export function htmlTag<N extends keyof HTMLElementTagNameMap>(tagName: N): () => HTMLElementTemplate<N> {
    return function(): HTMLElementTemplate<N> {
        return {
            child: arguments.length > 1 ? arguments : arguments[0],
            tagName: tagName,
            hydrate: hydrateHTMLElement,
            serverRender: serverRenderHTMLElement
        };
    };
}

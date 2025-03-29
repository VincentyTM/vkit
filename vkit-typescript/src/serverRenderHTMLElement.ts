import { appendChild, createServerElement, ServerElement } from "./createServerElement.js";
import { HTMLElementTemplate } from "./htmlTag.js";
import { serverRender } from "./serverRender.js";

export function serverRenderHTMLElement(container: ServerElement, template: HTMLElementTemplate<keyof HTMLElementTagNameMap>): void {
    var element = createServerElement(template.tagName);
    serverRender(element, template.child);
    appendChild(container, element);
}

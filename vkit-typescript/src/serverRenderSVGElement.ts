import { appendChild, createServerElement, ServerElement } from "./createServerElement.js";
import { serverRender } from "./serverRender.js";
import { SVGElementTemplate } from "./svgTag.js";

export function serverRenderSVGElement(container: ServerElement, template: SVGElementTemplate<keyof SVGElementTagNameMap>): void {
	var element = createServerElement(template.tagName);
	serverRender(element, template.child);
	appendChild(container, element);
}

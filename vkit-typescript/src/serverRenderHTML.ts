import { HTMLTemplate } from "./html.js";
import { ServerElement } from "./createServerElement.js";
import { serverRender } from "./serverRender.js";

export function serverRenderHTML(element: ServerElement, template: HTMLTemplate<unknown>): void {
	if (element.children) {
		var args = template.args;
		var n = args.length;

		for (var i = 0; i < n; ++i) {
			var arg = args[i];

			if (typeof arg === "string") {
				element.children.push({
					text: arg
				});
			} else {
				serverRender(element, arg);
			}
		}
	}
}

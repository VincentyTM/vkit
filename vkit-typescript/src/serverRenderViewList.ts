import { ServerElement } from "./createServerElement.js";
import { ViewListTemplate } from "./viewList.js";
import { serverRender } from "./serverRender.js";

export function serverRenderViewList<T, P>(element: ServerElement, template: ViewListTemplate<T, P>): void {
	var list = template.models.get();
	var n = list.length;

	for (var i = 0; i < n; ++i) {
		serverRender(element, template.getItemTemplate(list[i]));
	}
}

import { createEffect, Effect } from "./createEffect.js";
import { ServerElement } from "./createServerElement.js";
import { serverRender } from "./serverRender.js";
import { updateEffect } from "./updateEffect.js";
import { ViewListTemplate } from "./viewList.js";

export function serverRenderViewList<T, P extends ParentNode>(
	element: ServerElement,
	listTemplate: ViewListTemplate<T, P>
): void {
	var parentEffect = listTemplate.parentEffect;
	var list = listTemplate.models.get();
	var n = list.length;

	for (var i = 0; i < n; ++i) {
		serverRenderViewListBlock(parentEffect, element, listTemplate, list[i]);
	}
}

function serverRenderViewListBlock<T, P extends ParentNode>(
	parentEffect: Effect,
	element: ServerElement,
	listTemplate: ViewListTemplate<T, P>,
	model: T
): void {
	var effect = createEffect(parentEffect, function(): void {
		serverRender(element, listTemplate.getItemTemplate(model));
	});
	updateEffect(effect);
}

import { createEffect } from "./createEffect.js";
import { ServerElement } from "./createServerElement.js";
import { serverRender } from "./serverRender.js";
import { updateEffect } from "./updateEffect.js";
import { ViewTemplate } from "./view.js";

export function serverRenderView(container: ServerElement, view: ViewTemplate<unknown>): void {	
	var parentEffect = view.parentEffect;

	var effect = createEffect(parentEffect, function(): void {
		serverRender(container, view.getTemplate());
	});

	updateEffect(effect);
}

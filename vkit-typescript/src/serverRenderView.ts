import { getEffect } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { ServerElement } from "./createServerElement.js";
import { serverRender } from "./serverRender.js";
import { updateEffect } from "./updateEffect.js";
import { ViewTemplate } from "./view.js";

export function serverRenderView(container: ServerElement, view: ViewTemplate<unknown, unknown>): void {	
	var parentEffect = getEffect();

	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		serverRender(container, view.getTemplate(view.signal ? view.signal.get() : null));
	});

	updateEffect(effect);
}

import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { updateEffect } from "./updateEffect.js";
import { update } from "./update.js";

export function reactive(app: () => void): void {
	var rootInjector = createInjector(true);
	var rootEffect = createEffect(undefined, app, undefined, rootInjector);

	updateEffect(rootEffect);
	update();
}

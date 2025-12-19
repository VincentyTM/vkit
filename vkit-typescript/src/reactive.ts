import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { updateEffect } from "./updateEffect.js";
import { update } from "./update.js";

export function reactive(app: () => void): void {
	var rootInjector = createInjector(undefined, true);
	var rootEffect = createEffect(undefined, app, undefined, rootInjector);

	rootInjector.effect = rootEffect;

	updateEffect(rootEffect);
	update();
}

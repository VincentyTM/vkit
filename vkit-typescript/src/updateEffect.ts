import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { throwError } from "./throwError.js";

export function updateEffect(effect: Effect): void {
	if (effect.isRendering) {
		throwError(new Error("Circular dependency detected"), effect.parent);
	}
	
	var previousEffect = getEffect(true);
	var previousInjector = getInjector(true);
	
	try {
		effect.isRendering = true;
		setEffect(undefined);
		destroyEffect(effect);
		setEffect(effect);
		setInjector(effect.injector);
		effect.updateHandler();
	} catch (error) {
		throwError(error, effect);
	} finally {
		setEffect(previousEffect);
		setInjector(previousInjector);
		effect.isRendering = false;
	}
}

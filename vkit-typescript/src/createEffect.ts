import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { Injector } from "./createInjector.js";
import { destroyEffect } from "./destroyEffect.js";
import { throwError } from "./throwError.js";

export interface Effect {
	children: Effect[] | undefined;
	destroyHandlers: (() => void)[] | undefined;
	errorHandlers: ((error: unknown) => void)[] | undefined;
	readonly parent: Effect | undefined;
	stack: string | undefined;
	render(): void;
}

export function createEffect(
	mount: () => void,
	parentEffect: Effect | undefined,
	injector: Injector | undefined
) : Effect {
	var isRendering = false;
	
	var effect = {
		children: undefined,
		destroyHandlers: undefined,
		errorHandlers: undefined,
		parent: parentEffect,
		stack: new Error().stack,
		render: updateEffect
	};
	
	function updateEffect(): void {
		if (isRendering) {
			throwError(new Error("Circular dependency detected"), effect.parent);
		}
		
		var previousEffect = getEffect(true);
		var previousInjector = getInjector(true);
		
		try {
			isRendering = true;
			setEffect(undefined);
			destroyEffect(effect);
			setEffect(effect);
			setInjector(injector);
			mount();
		} catch (error) {
			throwError(error, effect);
		} finally {
			setEffect(previousEffect);
			setInjector(previousInjector);
			isRendering = false;
		}
	}
	
	return effect;
}

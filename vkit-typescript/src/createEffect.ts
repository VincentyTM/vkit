import { emitUnmount } from "./emitUnmount.js";
import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { Injector } from "./createInjector.js";
import { throwError } from "./throwError.js";

export interface Effect {
	children: Effect[] | undefined;
	destroyHandlers: (() => void)[] | undefined;
	errorHandlers: ((error: unknown) => void)[] | undefined;
	parent: Effect | undefined;
	stack: string | undefined;
	render(): void;
}

export function createEffect(
	mount: () => void,
	parent?: Effect | undefined,
	injector?: Injector | undefined
) : Effect {
	var isRendering = false;
	
	var effect = {
		children: undefined,
		destroyHandlers: undefined,
		errorHandlers: undefined,
		parent: parent === undefined ? getEffect() : parent,
		stack: new Error().stack,
		render: updateEffect
	};
	
	if (injector === undefined) {
		injector = getInjector();
	}
	
	function updateEffect(): void {
		if (isRendering) {
			throwError(new Error("Circular dependency detected"), effect.parent);
		}
		
		var previousEffect = getEffect(true);
		var previousInjector = getInjector(true);
		
		try {
			isRendering = true;
			setEffect(undefined);
			emitUnmount(effect);
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

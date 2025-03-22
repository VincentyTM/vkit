import { emitUnmount } from "./emitUnmount.js";
import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { Injector } from "./createInjector.js";
import { throwError } from "./throwError.js";

export interface Effect {
	children: Effect[] | null;
	destroyHandlers: (() => void)[] | undefined;
	errorHandlers: ((error: unknown) => void)[] | null;
	parent: Effect | null;
	stack: string | undefined;
	render(): void;
}

export function createEffect(
	mount: () => void,
	parent?: Effect | null,
	injector?: Injector | null
) : Effect {
	var isRendering = false;
	
	var effect = {
		children: null,
		destroyHandlers: undefined,
		errorHandlers: null,
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
			setEffect(null);
			emitUnmount(effect);
			setEffect(effect);
			setInjector(injector || null);
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

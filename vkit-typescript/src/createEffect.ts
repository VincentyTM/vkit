import { Injector } from "./createInjector.js";

export interface Effect {
	children: Effect[] | undefined;
	destroyHandlers: (() => void)[] | undefined;
	readonly injector: Injector | undefined;
	isRendering: boolean;
	readonly parent: Effect | undefined;
    errorHandler: ((error: unknown) => void) | undefined;
	updateHandler(): void;
}

export function createEffect(
	parentEffect: Effect | undefined,
	injector: Injector | undefined,
	updateHandler: () => void,
    errorHandler?: ((error: unknown) => void) | undefined
) : Effect {
	return {
		children: undefined,
		destroyHandlers: undefined,
		injector: injector,
		isRendering: false,
		parent: parentEffect,
		errorHandler: errorHandler,
		updateHandler: updateHandler
	};
}

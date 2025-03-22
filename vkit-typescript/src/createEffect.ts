import { Injector } from "./createInjector.js";

export interface Effect {
	children: Effect[] | undefined;
	destroyHandlers: (() => void)[] | undefined;
	errorHandlers: ((error: unknown) => void)[] | undefined;
	readonly injector: Injector | undefined;
	isRendering: boolean;
	readonly parent: Effect | undefined;
	stack: string | undefined;
	updateHandler(): void;
}

export function createEffect(
	parentEffect: Effect | undefined,
	injector: Injector | undefined,
	updateHandler: () => void
) : Effect {
	return {
		children: undefined,
		destroyHandlers: undefined,
		errorHandlers: undefined,
		injector: injector,
		isRendering: false,
		parent: parentEffect,
		stack: new Error().stack,
		updateHandler: updateHandler
	};
}

import { Injector } from "./createInjector.js";
import { ReactiveNodeBase, ReactiveNodeType } from "./ReactiveNode.js";
import { DIRTY_FLAG } from "./reactiveNodeFlags.js";

export interface Effect extends ReactiveNodeBase {
	children: Effect[] | undefined;
	destroyHandlers: (() => void)[] | undefined;
	readonly injector: Injector | undefined;
	readonly parent: Effect | undefined;
	readonly type: ReactiveNodeType.Effect;
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
		flags: DIRTY_FLAG,
		injector: injector,
		parent: parentEffect,
		type: ReactiveNodeType.Effect,
		errorHandler: errorHandler,
		updateHandler: updateHandler
	};
}

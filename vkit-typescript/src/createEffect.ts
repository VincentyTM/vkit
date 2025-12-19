import { Injector } from "./createInjector.js";
import { ReactiveNodeBase, ReactiveNodeType } from "./ReactiveNode.js";
import { DIRTY_FLAG } from "./reactiveNodeFlags.js";
import { subscribe } from "./subscribe.js";
import { updateEffect } from "./updateEffect.js";

export interface Effect extends ReactiveNodeBase {
	children: Effect[] | undefined;
	destroyHandlers: (() => void)[] | undefined;
	readonly injector: Injector;
	readonly parent: Effect | undefined;
	readonly type: ReactiveNodeType.Effect;
	errorHandler: ((error: unknown) => void) | undefined;
	updateHandler(): void;
}

export function createEffect(
	parentEffect: Effect | undefined,
	updateHandler: () => void,
	errorHandler?: ((error: unknown) => void) | undefined,
	injector?: Injector
) : Effect {
	if (injector === undefined) {
		if (parentEffect === undefined) {
			throw new Error("Parent effect or injector must be defined");
		}
		injector = parentEffect.injector;
	}

	var effect: Effect = {
		children: undefined,
		destroyHandlers: undefined,
		flags: DIRTY_FLAG,
		injector: injector,
		parent: parentEffect,
		subscribers: [],
		type: ReactiveNodeType.Effect,
		errorHandler: errorHandler,
		update: updateEffect,
		updateHandler: updateHandler
	};

	if (parentEffect !== undefined) {
		subscribe(parentEffect, effect);
	}

	return effect;
}

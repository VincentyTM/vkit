import { Effect } from "./createEffect.js";
import { Injectable } from "./createInjectable.js";
import { Injector } from "./createInjector.js";

export interface Provider<T> {
    readonly effect: Effect;
    readonly injectable: Injectable<T>;
    readonly injector: Injector;
    instance: T | undefined;
    isCreated: boolean;
}

export function createProvider<T>(
    injectable: Injectable<T>,
    effect: Effect,
    injector: Injector
): Provider<T> {
    return {
        effect: effect,
        injectable: injectable,
        injector: injector,
        instance: undefined,
        isCreated: false
    };
}

import { Injectable } from "./createInjectable.js";
import { Provider } from "./createProvider.js";

export interface Injector {
    readonly allowMissingProvider: boolean;
    readonly parent: Injector | undefined;
    readonly providers: WeakMap<Injectable<unknown>, Provider<unknown>>;
}

export function createInjector(
    parentInjector: Injector | undefined,
    allowMissingProvider: boolean
): Injector {
    return {
        allowMissingProvider: allowMissingProvider,
        parent: allowMissingProvider ? undefined : parentInjector,
        providers: new WeakMap()
    };
}

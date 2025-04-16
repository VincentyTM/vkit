import { getEffect } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { SignalNode } from "./createSignalNode";
import { subscribe, unsubscribe } from "./subscribe.js";
import { updateSignalNode } from "./updateSignalNode.js";

export function signalSubscribe<T>(node: SignalNode<T>, callback: (value: T) => void): () => void {
    var parentEffect = getEffect();
    var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
        callback(updateSignalNode(node, true));
    });
    
    subscribe(node, effect);

    return function(): void {
        unsubscribe(node, effect);
    };
}

import { getEffect } from "./contextGuard.js";
import { SignalNode } from "./createSignalNode.js";
import { onDestroy } from "./onDestroy.js";
import { ReactiveNode } from "./ReactiveNode.js";
import { updateEffect } from "./updateEffect.js";

export var INITIAL_SIGNAL_VALUE = {} as const;

export function updateSignalNode<T>(node: SignalNode<T>, tracked: boolean): T {
    if (node.value === INITIAL_SIGNAL_VALUE) {
        updateEffect(node.signalEffect);
    }

    var evaluatedNode = getEffect(true);
    
    if (tracked && evaluatedNode !== undefined) {
        signalSubscribe(node, evaluatedNode, false);
    }
    
    return node.value as T;
}

export function signalSubscribe<T>(
    source: SignalNode<T>,
    target: ReactiveNode,
    persistent: boolean
): () => void {
    var subscribers = source.subscribers;
    var effect = getEffect(true);
    
    subscribers.push(target);
    
    function unsubscribe(): void {
        for (var i = subscribers.length; i--;) {
            if (subscribers[i] === target) {
                subscribers.splice(i, 1);
                break;
            }
        }
    }
    
    if (effect !== source.parentEffect && !persistent) {
        onDestroy(unsubscribe);
    }
    
    return unsubscribe;
}

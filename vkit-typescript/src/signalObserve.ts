import { SignalSubscription } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { INITIAL_SIGNAL_VALUE, SignalNode } from "./createSignalNode.js";
import { onDestroy } from "./onDestroy.js";
import { updateEffect } from "./updateEffect.js";

export function signalObserve<T>(node: SignalNode<T>, tracked: boolean): T {
    if (node.value === INITIAL_SIGNAL_VALUE) {
        updateEffect(node.signalEffect);
    }

    var evaluatedNode = getEffect(true);
    
    if (tracked && evaluatedNode !== undefined) {
        signalSubscribe(node, function(): void {
            updateEffect(evaluatedNode!);
        }, false);
    }
    
    return node.value as T;
}

export function signalSubscribe<T>(
    node: SignalNode<T>,
    callback: (value: T) => void,
    persistent: boolean
): () => void {
    var subscriptions = node.subscriptions;
    var effect = getEffect(true);
    var subscription: SignalSubscription<T> = {callback: callback};
    
    subscriptions.push(subscription);
    
    function unsubscribe(): void {
        subscription.callback = null;
        
        for (var i = subscriptions.length; i--;) {
            if (subscriptions[i] === subscription) {
                subscriptions.splice(i, 1);
                break;
            }
        }
    }
    
    if (effect !== node.parentEffect && !persistent) {
        onDestroy(unsubscribe);
    }
    
    return unsubscribe;
}

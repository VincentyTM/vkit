import { SignalSubscription } from "./computed.js";
import { getEffect, getInjector } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { isSignal } from "./isSignal.js";
import { ReactiveNodeBase, ReactiveNodeType } from "./ReactiveNode.js";
import { DIRTY_FLAG } from "./reactiveNodeFlags.js";
import { updateEffect } from "./updateEffect.js";

export interface SignalNode<T> extends ReactiveNodeBase {
	readonly dependencies: unknown[] | undefined;
    readonly parentEffect: Effect | undefined;
    readonly signalEffect: Effect;
    readonly subscriptions: SignalSubscription<T>[];
    value: unknown;
	computeValue(...args: unknown[]): T;
    invalidate(): void;
}

export var INITIAL_SIGNAL_VALUE = {} as const;

export function createSignalNode<T>(
    computeValue: (...args: unknown[]) => T,
    dependencies: unknown[] | undefined
): SignalNode<T> {
    var parentEffect = getEffect(true);

    var node: SignalNode<T> = {
        dependencies: dependencies,
        flags: DIRTY_FLAG,
        parentEffect: parentEffect,
        signalEffect: createEffect(parentEffect, getInjector(true), updateHandler),
        subscriptions: [],
        type: ReactiveNodeType.Signal,
        value: INITIAL_SIGNAL_VALUE,
        computeValue: computeValue,
        invalidate: invalidate
    };
	
	if (dependencies) {
		var n = dependencies.length as number;
		
		for (var i = 0; i < n; ++i) {
			var input = dependencies[i];
			
			if (isSignal(input)) {
				input.subscribe(invalidate);
			}
		}
	}

    function invalidate(): void {
        updateEffect(node.signalEffect);
    }

    function updateHandler(): void {
        var newValue: T;
        
        if (dependencies) {
            var n = dependencies.length as number;
            var args = new Array<unknown>(n);
            
            for (var i = 0; i < n; ++i) {
                var input = dependencies[i];
                args[i] = isSignal(input) ? input.get() : input;
            }
            
            newValue = computeValue.apply(null, args);
        } else {
            newValue = computeValue();
        }
    
        var oldValue = node.value;
        
        if (oldValue === newValue) {
            return;
        }
    
        node.value = newValue;
    
        if (oldValue === INITIAL_SIGNAL_VALUE) {
            return;
        }
        
        var subs = node.subscriptions.slice();
        var m = subs.length;
        
        for (var i = 0; i < m; ++i) {
            var sub = subs[i];
            if (sub.callback) {
                sub.callback(node.value as T);
            }
        }
    }

    return node;
}

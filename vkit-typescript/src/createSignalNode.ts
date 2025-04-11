import { getReactiveNode } from "./contextGuard.js";
import { ReactiveNodeBase, ReactiveNodeType } from "./ReactiveNode.js";
import { DIRTY_FLAG } from "./reactiveNodeFlags.js";
import { subscribe } from "./subscribe.js";
import { updateSignalNode } from "./updateSignalNode.js";

export interface SignalNode<T> extends ReactiveNodeBase {
	readonly dependencies: ArrayLike<unknown> | undefined;
    readonly type: ReactiveNodeType.Signal;
    value: unknown;
	computeValue(...args: unknown[]): T;
}

var INITIAL_SIGNAL_VALUE = {} as const;

export function createSignalNode<T>(
    computeValue: (...args: never[]) => T,
    dependencies: ArrayLike<unknown> | undefined
): SignalNode<T> {
    var node: SignalNode<T> = {
        dependencies: dependencies,
        flags: DIRTY_FLAG,
        subscribers: [],
        type: ReactiveNodeType.Signal,
        value: INITIAL_SIGNAL_VALUE,
        computeValue: computeValue,
        update: updateSignalNode
    };

    var evaluatedNode = getReactiveNode(true);

    if (evaluatedNode !== undefined) {
        subscribe(evaluatedNode, node);
    }

    return node;
}

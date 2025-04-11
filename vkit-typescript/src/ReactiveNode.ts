import { Effect } from "./createEffect.js";
import { SignalNode } from "./createSignalNode.js";

export type ReactiveNode = SignalNode<unknown> | Effect;

export interface ReactiveNodeBase {
    flags: number;
    subscribers: ReactiveNode[];
    readonly type: ReactiveNodeType;
    update(node: ReactiveNode, tracked: boolean): void;
}

export enum ReactiveNodeType {
    Effect,
    Signal,
}

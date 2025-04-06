import { Effect } from "./createEffect.js";
import { SignalNode } from "./createSignalNode.js";

export type ReactiveNode = SignalNode<unknown> | Effect;

export interface ReactiveNodeBase {
    readonly type: ReactiveNodeType;
}

export enum ReactiveNodeType {
    Effect,
    Signal,
}

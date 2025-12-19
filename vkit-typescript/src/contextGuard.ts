import { Effect } from "./createEffect.js";
import { ReactiveNode, ReactiveNodeType } from "./ReactiveNode.js";

var evaluatedNode: ReactiveNode | undefined;

export function getEffect(): Effect;

export function getEffect(doNotThrow: true): Effect | undefined;

export function getEffect(doNotThrow?: boolean): Effect | undefined {
	if (evaluatedNode === undefined || evaluatedNode.type !== ReactiveNodeType.Effect) {
		if (doNotThrow) {
			return undefined;
		}
		throw new Error("This function can only be called synchronously from a reactive effect");
	}

	return evaluatedNode;
}

export function getReactiveNode(): ReactiveNode;

export function getReactiveNode(doNotThrow: true): ReactiveNode | undefined;

export function getReactiveNode(doNotThrow?: boolean): ReactiveNode | undefined {
	if (!doNotThrow && evaluatedNode === undefined) {
		throw new Error("This function can only be called synchronously from a reactive context");
	}

	return evaluatedNode;
}

export function setReactiveNode(node: ReactiveNode | undefined): void {
	evaluatedNode = node;
}

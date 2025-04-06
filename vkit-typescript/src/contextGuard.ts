import { Effect } from "./createEffect.js";
import { Injector } from "./createInjector.js";
import { ReactiveNode, ReactiveNodeType } from "./ReactiveNode.js";

var evaluatedNode: ReactiveNode | undefined;
var evaluatedInjector: Injector | undefined;

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

export function getInjector(): Injector;

export function getInjector(doNotThrow: true): Injector | undefined;

export function getInjector(doNotThrow?: boolean): Injector | undefined {
	if (!doNotThrow && (evaluatedNode === undefined || evaluatedNode.type !== ReactiveNodeType.Effect)) {
		throw new Error("This function can only be called synchronously from an injector context");
	}

	return evaluatedInjector;
}

export function setInjector(injector: Injector | undefined): void {
	evaluatedInjector = injector;
}

export function setReactiveNode(node: ReactiveNode | undefined): void {
    evaluatedNode = node;
}

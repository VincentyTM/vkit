import { ReactiveNode, ReactiveNodeType } from "./ReactiveNode.js";

export function subscribe(source: ReactiveNode, target: ReactiveNode): void {
	var subscribers = source.subscribers;

	for (var i = subscribers.length; i--;) {
		if (subscribers[i] === target) {
			return;
		}
	}

	subscribers.push(target);

	if (target.type === ReactiveNodeType.Effect) {
		target.sources.push(source);
	}
}

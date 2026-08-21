import { ReactiveNode } from "./ReactiveNode.js";
import { DESTROYED_FLAG } from "./reactiveNodeFlags.js";

export function destroySubscribers(node: ReactiveNode): void {
	var subscribers = node.subscribers;
	var n = subscribers.length;

	for (var i = 0; i < n; ++i) {
		var subscriber = subscribers[i];
		if (subscriber.parent === node) {
			subscriber.flags |= DESTROYED_FLAG;
		}
	}
}

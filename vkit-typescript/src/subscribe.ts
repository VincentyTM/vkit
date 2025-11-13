import { ReactiveNode } from "./ReactiveNode.js";

export function subscribe(source: ReactiveNode, target: ReactiveNode): void {
	var subscribers = source.subscribers;

	for (var i = subscribers.length; i--;) {
		if (subscribers[i] === target) {
			return;
		}
	}

	subscribers.push(target);
}

export function unsubscribe(source: ReactiveNode, target: ReactiveNode): void {
	var subscribers = source.subscribers;

	for (var i = subscribers.length; i--;) {
		if (subscribers[i] === target) {
			subscribers.splice(i, 1);
			return;
		}
	}
}

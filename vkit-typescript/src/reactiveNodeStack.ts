import { destroySubscribers } from "./destroySubscribers.js";
import { ReactiveNode } from "./ReactiveNode.js";
import { DESTROYED_FLAG, DIRTY_FLAG, TO_BE_EVALUATED_FLAG, VISITED_FLAG } from "./reactiveNodeFlags.js";
import { enqueueUpdate } from "./update.js";

var stack: ReactiveNode[] = [];

export function flush(): void {
	var n: number;
	
	while (n = stack.length) {
		var currentStack = stack;

		stack = [];
		
		for (var i = n - 1; i >= 0; --i) {
			var node = currentStack[i];
			node.flags = (node.flags & ~VISITED_FLAG) | TO_BE_EVALUATED_FLAG;
		}
	
		for (var i = n - 1; i >= 0; --i) {
			var node = currentStack[i];

			node.flags &= ~TO_BE_EVALUATED_FLAG;

			if (node.flags & DESTROYED_FLAG) {
				destroySubscribers(node);
			} else {
				node.update(node, false);
			}
		}
	}
}

export function invalidateNode(node: ReactiveNode): void {
	node.flags |= DIRTY_FLAG;
	collectOrderedStack(node, stack);
	enqueueUpdate(flush);
}

function collectOrderedStack(node: ReactiveNode, stack: ReactiveNode[]): void {
	if (!(node.flags & VISITED_FLAG)) {
		node.flags |= VISITED_FLAG;
		
		var subscribers = node.subscribers;
		var n = subscribers.length;

		for (var i = 0; i < n; ++i) {
			collectOrderedStack(subscribers[i], stack);
		}
		
		stack.push(node);
	}
}

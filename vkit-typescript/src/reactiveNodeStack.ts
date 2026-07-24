import { destroySubscribers } from "./destroySubscribers.js";
import { ReactiveNode, ReactiveNodeType } from "./ReactiveNode.js";
import { DESTROYED_FLAG, DIRTY_FLAG, IN_STACK_FLAG } from "./reactiveNodeFlags.js";
import { enqueueUpdate } from "./update.js";

var count = 0;
var stack: ReactiveNode[] = [];
var globalVersion = 0;

export function flush(): void {
	while (count > 0) {
		var node = stack[count - 1];

		node.flags &= ~IN_STACK_FLAG;
		--count;

		if (node.flags & DESTROYED_FLAG) {
			destroySubscribers(node);
			continue;
		}

		if (node.type === ReactiveNodeType.Signal && node.subscribers.length === 0) {
			continue;
		}

		node.update(node, false);
	}

	if (0 < stack.length) {
		stack.splice(0, stack.length);
	}
}

export function getGlobalVersion(): number {
	return globalVersion;
}

export function invalidateNode(node: ReactiveNode): void {
	++globalVersion;
	node.flags |= DIRTY_FLAG;
	collectOrderedStack(node, stack);
	enqueueUpdate(flush);
}

function collectOrderedStack(node: ReactiveNode, stack: ReactiveNode[]): void {
	if (!(node.flags & IN_STACK_FLAG)) {
		node.flags |= IN_STACK_FLAG;

		var subscribers = node.subscribers;
		var n = subscribers.length;

		for (var i = 0; i < n; ++i) {
			collectOrderedStack(subscribers[i], stack);
		}

		if (count < stack.length) {
			stack.splice(count, stack.length - count, node);
			count = stack.length;
		} else {
			count = stack.push(node);
		}
	}
}

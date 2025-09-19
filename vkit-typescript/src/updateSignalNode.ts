import { getReactiveNode, setReactiveNode } from "./contextGuard.js";
import { SignalNode } from "./createSignalNode.js";
import { isSignal } from "./isSignal.js";
import { COMPUTING_FLAG, DIRTY_FLAG, FAILED_FLAG, TO_BE_EVALUATED_FLAG } from "./reactiveNodeFlags.js";
import { subscribe } from "./subscribe.js";

export function updateSignalNode<T>(node: SignalNode<T>, tracked: boolean): T {
	var evaluatedNode = getReactiveNode(true);

	if (tracked && evaluatedNode !== undefined) {
		subscribe(node, evaluatedNode);
	}

	if (node.flags & (DIRTY_FLAG | TO_BE_EVALUATED_FLAG)) {
		if (node.flags & COMPUTING_FLAG) {
			throw new Error("Cycle detected");
		}

		node.flags |= COMPUTING_FLAG;
		
		var subscribers = node.subscribers;

		try {
			setReactiveNode(node);

			var dependencies = node.dependencies;
			var newValue: T;
			
			if (dependencies) {
				var n = dependencies.length;
				var resolvedDependencies = Array.prototype.slice.call(dependencies);
				
				for (var i = 0; i < n; ++i) {
					var dependency = dependencies[i];
					resolvedDependencies[i] = isSignal(dependency) ? dependency() : dependency;
				}
	
				newValue = node.computeValue.apply(node, resolvedDependencies as never[]);
			} else {
				newValue = node.computeValue();
			}

			var oldValue = node.value;
			
			if (newValue !== oldValue) {
				node.value = newValue;
				
				var n = subscribers.length;

				for (var i = 0; i < n; ++i) {
					subscribers[i].flags |= DIRTY_FLAG;
				}
			} else {
				node.subscribers = subscribers;
			}

			node.flags &= ~FAILED_FLAG;
		} catch (error) {
			node.value = error;
			node.flags |= FAILED_FLAG;
			node.subscribers = subscribers;
		} finally {
			node.flags &= ~(COMPUTING_FLAG | DIRTY_FLAG);
			setReactiveNode(evaluatedNode);
		}
	}

	if (node.flags & FAILED_FLAG) {
		throw node.value;
	}

	return node.value as T;
}

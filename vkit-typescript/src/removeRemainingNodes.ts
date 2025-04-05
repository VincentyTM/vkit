import { HydrationPointer } from "./hydrate.js";

export function removeRemainingNodes(pointer: HydrationPointer<ParentNode>): void {
	var parentNode = pointer.context;
	var removed = pointer.currentNode;
	
	while (removed && removed !== pointer.stopNode) {
		var next = removed.nextSibling;
		parentNode.removeChild(removed);
		removed = next;
	}
}

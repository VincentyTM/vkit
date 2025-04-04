import { bind } from "./bind.js";
import { deepPush } from "./deepPush.js";
import { Template } from "./Template.js";

export function insert<P>(
	children: Template<P>,
	nextSibling: Node,
	context: P,
	crossView: boolean
): void {
	var parent = nextSibling.parentNode;
	
	if (!parent) {
		return;
	}
	
	function push(node: Node): void {
		parent!.insertBefore(node, nextSibling);
	}
	
	if ((nextSibling as any).before) {
		var array: Template<P>[] = [];
		
		deepPush(
			array,
			children,
			context,
			bind,
			crossView
		);
		
		(nextSibling as any).before.apply(nextSibling, array);
	} else {
		deepPush(
			{push: push},
			children,
			context,
			bind,
			crossView
		);
	}
}

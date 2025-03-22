import { bind } from "./bind.js";
import { deepPush } from "./deepPush.js";
import { Template } from "./Template.js";

export function insert<ItemT extends Template<ContextT>, ContextT>(
	children: ItemT,
	nextSibling: Node,
	context: ContextT,
	crossView?: boolean
): void {
	var parent = nextSibling.parentNode;
	
	if (!parent) {
		return;
	}
	
	function push(node: ItemT & Node): void {
		parent!.insertBefore(node, nextSibling);
	}
	
	if ((nextSibling as any).before) {
		var array: ItemT[] = [];
		
		deepPush<ItemT, ContextT>(
			array,
			children,
			context,
			bind,
			!!crossView
		);
		
		(nextSibling as any).before.apply(nextSibling, array);
	} else {
		deepPush<ItemT, ContextT>(
			{push: push},
			children,
			context,
			bind,
			!!crossView
		);
	}
}

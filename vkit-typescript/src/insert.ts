import bind from "./bind.js";
import deepPush from "./deepPush.js";

function insert<ItemType, ContextType>(
	children: ItemType,
	nextSibling: Node,
	context: ContextType,
	crossView?: boolean
): void {
	var parent = nextSibling.parentNode;
	
	if (!parent) {
		return;
	}
	
	function push(node: ItemType): void {
		parent!.insertBefore(node as unknown as Node, nextSibling);
	}
	
	if ((nextSibling as any).before) {
		var array: ItemType[] = [];
		
		deepPush<ItemType, ContextType>(
			array,
			children,
			context,
			bind,
			!!crossView
		);
		
		(nextSibling as any).before.apply(nextSibling, array);
	} else {
		deepPush<ItemType, ContextType>(
			{push: push},
			children,
			context,
			bind,
			!!crossView
		);
	}
}

export default insert;

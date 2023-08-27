import deepPush from "./deepPush";

function insert<ItemType, ContextType>(
	children: ItemType,
	nextSibling: Node,
	context: ContextType,
	bind: (
		target: ContextType,
		modifier: ItemType,
		isExternal?: boolean
	) => void
){
	var parent = nextSibling.parentNode;
	
	if(!parent){
		return;
	}
	
	function push(node: ItemType){
		parent!.insertBefore(node as unknown as Node, nextSibling);
	}
	
	if( (nextSibling as any).before ){
		var array: ItemType[] = [];
		
		deepPush<ItemType, ContextType>(
			array,
			children,
			context,
			bind
		);
		
		(nextSibling as any).before.apply(nextSibling, array);
	}else{
		deepPush<ItemType, ContextType>(
			{push: push},
			children,
			context,
			bind
		);
	}
}

export default insert;
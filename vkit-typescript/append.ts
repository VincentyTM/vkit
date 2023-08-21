import deepPush from "./deepPush";

function append<ItemType, ContextType>(
	parent: {
		appendChild(node: ItemType): ItemType | void;
		append?(...nodes: ItemType[]): void;
	},
	children: ItemType,
	context: ContextType,
	bind: (
		target: ContextType,
		modifier: ItemType,
		isExternal?: boolean
	) => void
){
	function push(node: ItemType){
		parent.appendChild(node);
	}
	
	if( parent.append ){
		var array: ItemType[] = [];
		
		deepPush<ItemType, ContextType>(
			array,
			children,
			context,
			bind
		);
		
		parent.append.apply(parent, array);
	}else{
		deepPush<ItemType, ContextType>(
			{push: push},
			children,
			context,
			bind
		);
	}
}

export default append;

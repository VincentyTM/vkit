import {Bindings} from "./bind";
import deepPush from "./deepPush";

export default function append<ItemType, ContextType>(
	parent: {
		appendChild(node: ItemType): ItemType | void;
		append?(...nodes: ItemType[]): void;
	},
	children: ItemType,
	context: ContextType,
	bind: (
		target: ContextType,
		modifier: ItemType & Bindings<ContextType>,
		isExternal?: boolean
	) => void,
	crossView?: boolean
): void {
	function push(node: ItemType): void {
		parent.appendChild(node);
	}
	
	if (parent.append) {
		var array: ItemType[] = [];
		
		deepPush<ItemType, ContextType>(
			array,
			children,
			context,
			bind,
			!!crossView
		);
		
		parent.append.apply(parent, array);
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

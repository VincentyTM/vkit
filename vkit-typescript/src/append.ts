import type {Bindings} from "./bind.js";
import deepPush from "./deepPush.js";
import type {View} from "./view.js";

export default function append<ItemType extends View<ContextType>, ContextType>(
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

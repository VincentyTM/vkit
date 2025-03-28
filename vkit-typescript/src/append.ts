import { Bindings } from "./bind.js";
import { deepPush } from "./deepPush.js";
import { Template } from "./Template.js";

export function append<ItemT extends Template<ContextT>, ContextT>(
	parent: {
		appendChild(node: ItemT): ItemT | void;
		append?(...nodes: ItemT[]): void;
	},
	children: ItemT,
	context: ContextT,
	bind: (
		target: ContextT,
		modifier: ItemT & Bindings<ContextT>,
		isExternal?: boolean
	) => void,
	crossView?: boolean
): void {
	function push(node: ItemT): void {
		parent.appendChild(node);
	}
	
	if (parent.append) {
		var array: ItemT[] = [];
		
		deepPush<ItemT, ContextT>(
			array,
			children,
			context,
			bind,
			!!crossView
		);
		
		parent.append.apply(parent, array);
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

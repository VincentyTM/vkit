import { Bindings } from "./bind.js";
import { deepPush } from "./deepPush.js";
import { Template } from "./Template.js";

export function append<P>(
	parent: {
		appendChild<T extends Node>(node: T): T | void;
		append?(...nodes: Template<P>[]): void;
	},
	children: Template<P>,
	context: P,
	bind: (
		target: P,
		modifier: Bindings<P>,
		isExternal: boolean
	) => void,
	crossView: boolean
): void {
	function push(node: Node): void {
		parent.appendChild(node);
	}
	
	if (parent.append) {
		var array: Template<P>[] = [];
		
		deepPush(
			array,
			children,
			context,
			bind,
			crossView
		);
		
		parent.append.apply(parent, array);
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

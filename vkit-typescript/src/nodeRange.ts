import { insert } from "./insert.js";
import { remove } from "./remove.js";
import { Template } from "./Template.js";

export type NodeRange = {
	append(...children: Template[]): void;
	clear(): void;
	end: ChildNode;
	insertBefore(anchor: Node): void;
	remove(): void;
	start: ChildNode;
};

export function nodeRange(crossView?: boolean) : NodeRange {
	var start: ChildNode = document.createTextNode("");
	var end: ChildNode = document.createTextNode("");
	
	function clear(): void {
		if (!start.nextSibling) {
			throw new Error("Cannot clear detached range");
		}
		
		var parent = start.parentNode;
		
		if (parent) {
			for (var el = end.previousSibling; el && el !== start; el = end.previousSibling) {
				parent.removeChild(el);
			}
		}
	}
	
	function removeRange(): void {
		clear();
		remove(start);
		remove(end);
	}
	
	function append(): void {
		if (!start.nextSibling) {
			throw new Error("Cannot append to detached range");
		}
		insert(arguments, end, (start as any).parentNode, crossView);
	}
	
	function insertBefore(anchor: Node): void {
		if (!start.nextSibling) {
			throw new Error("Cannot insert detached range");
		}
		
		var parent = anchor.parentNode;
		
		if (parent) {
			for (var el: ChildNode | null = start; el && el !== end; el = next) {
				var next: ChildNode | null = el.nextSibling;
				parent.insertBefore(el, anchor);
			}
			parent.insertBefore(end, anchor);
		}
	}
	
	return {
		append: append,
		clear: clear,
		end: end,
		insertBefore: insertBefore,
		remove: removeRange,
		start: start
	};
}

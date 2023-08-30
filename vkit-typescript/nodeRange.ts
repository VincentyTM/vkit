import bind from "./bind";
import insert from "./insert";
import removeNode from "./remove";

import type {View} from "./view";

type NodeRange = {
	append(...children: View[]): void;
	clear(): void;
	end: ChildNode;
	insertBefore(anchor: Node): void;
	remove(): void;
	render(): View;
	start: ChildNode;
};

function createNodeRange() : NodeRange {
	var start: ChildNode = document.createTextNode("");
	var end: ChildNode = document.createTextNode("");
	
	function clear(){
		if(!start.nextSibling){
			throw new Error("Cannot clear detached range");
		}
		
		var parent = start.parentNode;
		
		if( parent ){
			for(var el = end.previousSibling; el && el !== start; el = end.previousSibling){
				parent.removeChild(el);
			}
		}
	}
	
	function remove(){
		clear();
		removeNode(start);
		removeNode(end);
	}
	
	function append(){
		if(!start.nextSibling){
			throw new Error("Cannot append to detached range");
		}
		
		insert(arguments, end, (start as any).parentNode, bind);
	}
	
	function insertBefore(anchor: Node){
		if(!start.nextSibling){
			throw new Error("Cannot insert detached range");
		}
		
		var parent = anchor.parentNode;
		
		if( parent ){
			var el: ChildNode | null = start;
			
			while( el && el !== end ){
				var next: ChildNode | null = el.nextSibling;
				parent.insertBefore(el, anchor);
				el = next;
			}
			
			parent.insertBefore(end, anchor);
		}
	}
	
	function render(){
		if(!start.nextSibling){
			throw new Error("Cannot render detached range");
		}
		
		var nodes: ChildNode[] = [];
		var parent = start.parentNode;
		
		if( parent ){
			for(var el: ChildNode | null = start; el && el !== end; el = el.nextSibling){
				nodes.push(el);
			}
			
			nodes.push(end);
		}
		
		return nodes;
	}
	
	return {
		append: append,
		clear: clear,
		end: end,
		insertBefore: insertBefore,
		remove: remove,
		render: render,
		start: start
	};
}

export type {NodeRange};

export default createNodeRange;

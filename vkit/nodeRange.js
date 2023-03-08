(function($, document){

var insert = $.insert;
var removeNode = $.remove;

function createNodeRange(){
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
	function render(){
		return [start, end];
	}
	
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
		insert(arguments, end);
	}
	
	function insertBefore(anchor){
		if(!start.nextSibling){
			throw new Error("Cannot insert detached range");
		}
		var parent = anchor.parentNode;
		if( parent ){
			var el = start;
			while( el && el !== end ){
				var next = el.nextSibling;
				parent.insertBefore(el, anchor);
				el = next;
			}
			parent.insertBefore(end, anchor);
		}
	}
	
	function getNodes(){
		if(!start.nextSibling){
			throw new Error("Cannot get nodes of detached range");
		}
		var nodes = $();
		var parent = start.parentNode;
		if( parent ){
			for(var el = start; el && el !== end; el = el.nextSibling){
				nodes.push(el);
			}
			nodes.push(end);
		}
		return nodes;
	}
	
	return {
		render: render,
		start: start,
		end: end,
		clear: clear,
		remove: remove,
		append: append,
		insertBefore: insertBefore,
		getNodes: getNodes
	};
}

$.nodeRange = createNodeRange;

})($, document);

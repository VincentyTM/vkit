(function($, document){

var bind = $.bind;
var insert = $.insert;
var removeNode = $.remove;

function createNodeRange(){
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
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
		
		insert(arguments, end, start.parentNode, bind);
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
	
	function render(){
		if(!start.nextSibling){
			throw new Error("Cannot render detached range");
		}
		
		var nodes = [];
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
		append: append,
		clear: clear,
		end: end,
		insertBefore: insertBefore,
		remove: remove,
		render: render,
		start: start
	};
}

$.nodeRange = createNodeRange;

})($, document);

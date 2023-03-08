(function($, document){

var insert = $.insert;
var removeNode = $.remove;

function createNodeRange(){
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
	function clear(){
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
		insert(arguments, end);
	}
	
	function insertBefore(anchor){
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

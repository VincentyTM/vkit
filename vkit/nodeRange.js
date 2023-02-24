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
				parent.insertBefore(el, anchor);
				el = el.nextSibling;
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

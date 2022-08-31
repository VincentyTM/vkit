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
	
	return {
		start: start,
		end: end,
		clear: clear,
		remove: remove,
		append: append,
		insertBefore: insertBefore
	};
}

$.nodeRange = createNodeRange;

})($, document);

(function($){

var append = $.append;

function insert(children, nextSibling, context, bind){
	var parent = nextSibling.parentNode;
	if(!parent){
		return;
	}
	function insertBefore(node){
		parent.insertBefore(node, nextSibling);
	}
	append({appendChild: insertBefore}, children, context, bind);
}

$.insert = insert;

})($);

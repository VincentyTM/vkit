(function($){

var deepPush = $.deepPush;

function insert(children, nextSibling, context, bind){
	var parent = nextSibling.parentNode;
	if(!parent){
		return;
	}
	
	function push(node){
		parent.insertBefore(node, nextSibling);
	}
	
	if( nextSibling.before ){
		var array = [];
		deepPush(array, children, context, bind);
		nextSibling.before.apply(nextSibling, array);
	}else{
		deepPush({push: push}, children, context, bind);
	}
}

$.insert = insert;

})($);

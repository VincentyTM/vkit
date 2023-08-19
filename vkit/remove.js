(function($){

function remove(node){
	var parent = node.parentNode;
	
	if( parent ){
		parent.removeChild(node);
	}
}

$.remove = remove;

})($);

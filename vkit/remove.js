(function($){

function removeAll(){
	for(var i=this.length; i--;){
		remove(this[i]);
	}
	return this;
}

function remove(node){
	var parent = node.parentNode;
	if( parent ){
		parent.removeChild(node);
	}
}

$.remove = remove;
$.fn.remove = removeAll;

})($);

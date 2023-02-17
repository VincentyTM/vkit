(function($, document){

var deepPush = $.deepPush;

function append(parent, children, context, bind){
	function push(node){
		parent.appendChild(node);
	}
	var pusher = {push: push};
	if( document.createDocumentFragment ){
		var container = parent;
		parent = document.createDocumentFragment();
		deepPush(pusher, children, context, bind);
		if( parent.firstChild ){
			container.appendChild(parent);
		}
	}else{
		deepPush(pusher, children, context, bind);
	}
}

function appendToThis(){
	append(this[0], arguments, this[0]);
	return this;
}

$.append = append;
$.fn.append = appendToThis;

})($, document);

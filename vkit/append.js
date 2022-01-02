(function($, document){

var deepPush = $.deepPush;

function append(parent, children, context, setProps){
	function push(node){
		parent.appendChild(node);
	}
	var pusher = {push: push};
	if( document.createDocumentFragment ){
		var container = parent;
		parent = document.createDocumentFragment();
		deepPush(pusher, children, context, setProps);
		if( parent.firstChild ){
			container.appendChild(parent);
		}
	}else{
		deepPush(pusher, children, context, setProps);
	}
}

function appendToThis(){
	append(this[0], arguments);
	return this;
}

$.append = append;
$.fn.append = appendToThis;

})($, document);

(function($){

var deepPush = $.deepPush;

function append(parent, children, context, bind){
	function push(node){
		parent.appendChild(node);
	}
	
	if( parent.append ){
		var array = [];
		deepPush(array, children, context, bind);
		parent.append.apply(parent, array);
	}else{
		deepPush({push: push}, children, context, bind);
	}
}

$.append = append;

})($);

(function($){

function empty(parent){
	if( parent.replaceChildren ){
		parent.replaceChildren();
	}else{
		var child;
		while( child = parent.lastChild ){
			parent.removeChild(child);
		}
	}
}

function emptyAll(){
	for(var i=this.length; i--;){
		empty(this[i]);
	}
	return this;
}

$.empty = empty;
$.fn.empty = emptyAll;

})($);

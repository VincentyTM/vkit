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

$.empty = empty;

})($);

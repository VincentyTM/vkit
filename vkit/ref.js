(function($){

var unmount = $.unmount;

function createRef(){
	function reset(){
		ref.current = null;
	}
	function ref(el){
		if( ref.current ){
			throw new Error("This reference has already been set.");
		}
		ref.current = el;
		unmount(reset);
	}
	ref.current = null;
	return ref;
}

$.ref = createRef;

})($);

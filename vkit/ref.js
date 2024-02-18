(function($){

var onUnmount = $.onUnmount;

function createRef(){
	function reset(){
		ref.current = null;
	}
	
	function ref(value) {
		if (ref.current) {
			throw new Error("This reference has already been set.");
		}
		
		ref.current = value;
		onUnmount(reset);
	}
	ref.current = null;
	return ref;
}

$.ref = createRef;

})($);

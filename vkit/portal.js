(function($){

var group = $.group;
var append = $.append;
var unmount = $.unmount;

function createPortal(children, parent){
	function remove(){
		group(children).remove();
	}
	append(parent, children);
	unmount(remove);
}

$.portal = createPortal;

})($);

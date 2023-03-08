(function($){

var deepPush = $.deepPush;

function group(){
	return deepPush($(), arguments, null, null);
}

$.group = group;

})($);

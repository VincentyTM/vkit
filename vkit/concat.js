(function($){

var map = $.map;

function concat(){
	return Array.prototype.join.call(arguments, "");
}

$.concat = map(concat);

})($);

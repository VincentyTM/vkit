(function($){

var stateMap = $.stateMap;

function concat(){
	return Array.prototype.join.call(arguments, "");
}

$.concat = stateMap(concat);

})($);

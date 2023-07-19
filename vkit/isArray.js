(function($){

var toString = Object.prototype.toString;

function isArray(value){
	return toString.call(value) === "[object Array]";
}

$.isArray = Array.isArray || isArray;

})($);

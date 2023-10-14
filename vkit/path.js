(function($){

var history = $.history;
var parseURL = $.parseURL;

function path(win){
	return parseURL(history(win).url()).base;
}

$.path = path;

})($);

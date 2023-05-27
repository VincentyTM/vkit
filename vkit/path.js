(function($){

var createHistoryHandler = $.history;
var url = $.url;

function path(win){
	return url(createHistoryHandler(win).url()).base;
}

$.path = path;

})($);

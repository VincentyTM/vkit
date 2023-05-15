(function($){

var bind = $.bind;
var getWindow = $.window;

function getDocument(){
	var doc = getWindow().document;
	var n = arguments.length;
	for(var i=0; i<n; ++i){
		bind(doc, arguments[i]);
	}
	return doc;
}

$.document = getDocument;

})($);

(function($, undefined){

var insert = $.insert;
var remove = $.remove;
var currentScript = $.currentScript();

function replaceScript(getView){
	var script = currentScript;
	var view = typeof getView === "function" ? getView(script) : getView;
	insert(view, script);
	remove(script);
	return view;
}

$.replaceScript = replaceScript;

})($);

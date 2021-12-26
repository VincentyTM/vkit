(function($, undefined){

var insert = $.insert;
var remove = $.remove;
var getCurrentScript = $.currentScript;

function replaceScript(getView){
	var script = getCurrentScript();
	var view = typeof getView === "function" ? getView(script) : getView;
	insert(view, script);
	remove(script);
	return view;
}

$.replaceScript = replaceScript;

})($);

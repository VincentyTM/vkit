(function($){

var currentScript = $.currentScript;
var insert = $.insert;
var remove = $.remove;
var render = $.render;

function replaceScript(getView){
	var script = currentScript();
	var view = typeof getView === "function" ? render(getView) : getView;
	
	insert(view, script);
	remove(script);
	
	return view;
}

$.replaceScript = replaceScript;

})($);

(function($){

var insert = $.insert;
var remove = $.remove;
var renderTree = $.fn.render;
var getCurrentScript = $.currentScript;

function replaceScript(getView){
	var script = getCurrentScript();
	var view = typeof getView === "function" ? renderTree.call([], getView) : getView;
	insert(view, script);
	remove(script);
	return view;
}

$.replaceScript = replaceScript;

})($);

(function($, undefined){

var append = $.append;
var currentScript = $.currentScript();

function replaceScript(getView){
	var script = currentScript;
	var parent = script.parentNode;
	var view = typeof getView === "function" ? getView(script) : getView;
	function insert(node){
		parent.insertBefore(node, script);
	}
	if( script.parentNode === parent ){
		append({appendChild: insert}, view);
		parent.removeChild(script);
	}
	return view;
}

$.replaceScript = replaceScript;

})($);

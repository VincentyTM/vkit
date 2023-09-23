(function($){

var createView = $.view;
var currentScript = $.currentScript;
var insert = $.insert;
var remove = $.remove;
var rootComponent = $.rootComponent;
var rootInjector = $.rootInjector;
var setComponent = $.setComponent;
var setInjector = $.setInjector;
var update = $.update;

function replaceScript(getView){
	var script = currentScript();
	
	try{
		setComponent(rootComponent);
		setInjector(rootInjector);
		
		var view = typeof getView === "function" ? createView(getView) : getView;
		var context = script.previousElementSibling;
		
		if (context === undefined) {
			context = script;
			
			while (context = context.previousSibling) {
				if (context.nodeType === 1) {
					break;
				}
			}
		}
		
		if (!context) {
			context = script.parentNode;
		}
		
		insert(view, script, context);
		remove(script);
	}finally{
		setComponent(null);
		setInjector(null);
	}
	
	update();
	return rootComponent;
}

$.replaceScript = replaceScript;

})($);

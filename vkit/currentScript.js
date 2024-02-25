(function($, document) {

function currentScript(doc) {
	if (!doc) {
		doc = document;
	}
	
	if (doc.currentScript) {
		return doc.currentScript;
	}
	
	var scripts = doc.scripts;
	
	for (var i = scripts.length - 1; i >= 0; --i) {
		var script = scripts[i];
		
		if (!script.readyState || script.readyState === "interactive") {
			return script;
		}
	}
	
	throw new ReferenceError("Current script not found!");
}

$.currentScript = currentScript;

})($, document);

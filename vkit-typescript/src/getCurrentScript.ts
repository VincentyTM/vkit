export function getCurrentScript(document: Document): HTMLOrSVGScriptElement {
	if (document.currentScript) {
		return document.currentScript;
	}
	
	var scripts = document.scripts;
	
	for (var i = scripts.length - 1; i >= 0; --i) {
		var script = scripts[i];
		
		if (!(script as any).readyState || (script as any).readyState === "interactive") {
			return script;
		}
	}
	
	throw new ReferenceError("Current script not found!");
}

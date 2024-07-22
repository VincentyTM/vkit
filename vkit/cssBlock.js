(function($) {

function prependHyphen(text) {
	return "-" + text;
}

function cssBlock(selector, cssDeclaration, variables) {
	if (typeof cssDeclaration === "string") {
		return cssDeclaration.replace(/::?this\b/ig, selector);
	}
	
	var a = [selector, "{"];
	
	for (var prop in cssDeclaration) {
		var val = cssDeclaration[prop];
		
		if (val) {
			prop = prop.replace(/[A-Z]/g, prependHyphen).toLowerCase();
			
			if (variables && val.charAt(0) === "@") {
				val = variables[val.substring(1)] || "";
			}
			
			a.push(prop, ":", val, ";");
		}
	}
	
	a.push("}");
	return a.join("");
}

$.cssBlock = cssBlock;

})($);

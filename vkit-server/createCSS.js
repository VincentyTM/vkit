export default function createCSS(blocks, variables) {
	var a = [];
	
	for (var selector in blocks) {
		if (/^[a-zA-Z0-9\-_]/.test(selector)) {
			throw new SyntaxError("Selector cannot be extended with " + selector);
		}
		
		a.push(cssBlock("::this" + selector, blocks[selector], variables));
	}
	
	return a.join("");
}

function prependHyphen(text) {
	return "-" + text;
}

function cssBlock(selector, cssDeclaration, variables) {
	if (typeof cssDeclaration === "string") {
		return cssDeclaration.replace(/::?this\b/ig, selector);
	}
	
	var a = [selector, "{"];
	
	function replaceVariable(varName) {
		return variables[varName.substring(1)] || "";
	}
	
	for (var prop in cssDeclaration) {
		var val = cssDeclaration[prop];
		
		if (val) {
			prop = prop.replace(/[A-Z]/g, prependHyphen).toLowerCase();
			
			if (typeof val === "function") {
				val = val(variables);
			} else if (variables && val.indexOf("@") !== -1) {
				val = val.replace(/@[a-zA-Z_$][a-zA-Z_$0-9]*/g, replaceVariable);
			}
			
			a.push(prop, ":", val, ";");
		}
	}
	
	a.push("}");
	return a.join("");
}

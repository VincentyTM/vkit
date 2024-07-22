(function($) {

var cssBlock = $.cssBlock;

function createCSS(blocks, variables) {
	var a = [];
	
	for (var selector in blocks) {
		if (/^[a-zA-Z0-9\-_]/.test(selector)) {
			throw new SyntaxError("Selector cannot be extended with " + selector);
		}
		
		a.push(cssBlock("::this" + selector, blocks[selector], variables));
	}
	
	return a.join("");
}

$.createCSS = createCSS;

})($);

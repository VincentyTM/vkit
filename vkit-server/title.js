var createComputedSignal = require("./signal.js").computed;
var scope = require("./scope.js");

function setTitle(title) {
	if (title === undefined) {
		var currentScope = scope.get();
		
		return createComputedSignal(function() {
			return currentScope.getWindowData("title");
		});
	}
	
	scope.get().addWindowData("title", title);
}

module.exports = setTitle;

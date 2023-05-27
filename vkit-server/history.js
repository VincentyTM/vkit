var createState = require("./state.js");
var scope = require("./scope.js");

function createHistoryHandler(){
	function selectURL(){
		var currentScope = scope.get();
		
		return createState(currentScope.req.url);
	}
	
	return {
		url: selectURL
	};
}

module.exports = createHistoryHandler;

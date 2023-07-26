var createComputedSignal = require("./signal.js").computed;
var scope = require("./scope.js");

function createHistoryHandler(){
	function selectURL(){
		var currentScope = scope.get();
		var url = currentScope.req.url;
		
		return createComputedSignal(function(){
			return url;
		});
	}
	
	return {
		url: selectURL
	};
}

module.exports = createHistoryHandler;

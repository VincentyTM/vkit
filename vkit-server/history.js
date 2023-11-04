var createComputedSignal = require("./signal.js").computed;
var scope = require("./scope.js");

function history() {
	function selectURL() {
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

module.exports = history;

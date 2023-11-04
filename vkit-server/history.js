var computed = require("./computed.js");
var scope = require("./scope.js");

function history() {
	function selectURL() {
		var currentScope = scope.get();
		var url = currentScope.req.url;
		
		return computed(function() {
			return url;
		});
	}
	
	return {
		url: selectURL
	};
}

module.exports = history;

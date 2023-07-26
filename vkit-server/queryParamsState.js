var createHistoryHandler = require("./history.js");
var createQueryParams = require("./queryParams.js");
var url = require("./url.js");
var scope = require("./scope.js");

function createQueryParamsState(){
	var currentScope = scope.get();
	var historyHandler = createHistoryHandler();
	var queryParamsState = url(historyHandler.url()).queryParams;
	
	return function(name, allowObject){
		var state = queryParamsState.map(allowObject
			? function(queryParams){ return queryParams.get(name); }
			: function(queryParams){ return queryParams.getAsString(name); }
		);
		
		function getQuery(value){
			var url = currentScope.req.url;
			var pos = url.indexOf("?");
			var search = pos === -1 ? url : url.substring(0, pos);
			var queryParams = createQueryParams(search.substring(1));
			queryParams.set(name, value);
			var params = queryParams.toString();
			return params ? "?" + params : url.substring(0, pos);
		}
		
		return state;
	};
};

module.exports = createQueryParamsState;

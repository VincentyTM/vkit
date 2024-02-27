import createQueryParams from "./queryParams.js";
import history from "./history.js";
import parseURL from "./parseURL.js";
import {getScope} from "./scope.js";

export default function createQueryParamsState() {
	var currentScope = getScope();
	var historyHandler = history();
	var queryParamsState = parseURL(historyHandler.url()).queryParams;
	
	return function(name, allowObject) {
		var state = queryParamsState.map(allowObject
			? function(queryParams) { return queryParams.get(name); }
			: function(queryParams) { return queryParams.getAsString(name); }
		);
		
		function getQuery(value) {
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
}

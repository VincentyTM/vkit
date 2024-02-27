import computed from "./computed.js";
import {getScope} from "./scope.js";

export default function history() {
	function selectURL() {
		var currentScope = getScope();
		var url = currentScope.req.url;
		
		return computed(function() {
			return url;
		});
	}
	
	return {
		url: selectURL
	};
}

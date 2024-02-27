import createComputedSignal from "./computed.js";
import {getScope} from "./scope.js";

export default function setTitle(title) {
	if (title === undefined) {
		var currentScope = getScope();
		
		return createComputedSignal(function() {
			return currentScope.getWindowData("title");
		});
	}
	
	getScope().addWindowData("title", title);
}

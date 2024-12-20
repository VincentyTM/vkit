import createCSS from "./createCSS.js";
import createStyle from "./style.js";
import signal from "./signal.js";

export default function dynamicStyle(styleTemplate, initialVariables, attributeName) {
	var variables = signal(initialVariables || {});
	
	var style = createStyle(
		variables.map(function(currentVariables) {
			if (typeof styleTemplate === "function") {
				return createCSS(styleTemplate(currentVariables));
			}
			
			return createCSS(styleTemplate, currentVariables);
		}),
		
		attributeName
	);
	
	return {
		variables: variables,
		
		render: function() {
			return style;
		}
	};
}

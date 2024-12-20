(function($) {

var createCSS = $.createCSS;
var createStyle = $.style;
var signal = $.signal;

function dynamicStyle(styleTemplate, initialVariables, attributeName) {
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

$.dynamicStyle = dynamicStyle;

})($);

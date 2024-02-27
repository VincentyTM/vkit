import {getScope} from "./scope.js";

var globalStyleCount = 0;

function prepareCSS(css, selector){
	return css.replace(/::?this\b/ig, selector);
}

export default function style(css, attr){
	if(!attr){
		var currentScope = getScope(true);
		attr = "vkit-" + (currentScope ? "s-" + currentScope.nextStyleCount() : ++globalStyleCount);
	}
	var selector = "[" + attr + "]";
	
	function bind(el){
		getScope().addStyle(
			attr,
			prepareCSS(
				css && typeof css.get === "function" ? css.get() : css,
				selector
			)
		);
		
		if( el.setAttribute ){
			el.setAttribute(attr, "");
		}
	}
	
	bind.toString = function(){
		return selector;
	};
	
	return bind;
}

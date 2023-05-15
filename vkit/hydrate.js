(function($){

var append = $.append;
var bind = $.bind;
var toArray = $.toArray;

function hydrate(parent, directives){
	var n = parent.length;
	if( typeof n === "number" && !parent.nodeType ){
		for(var i=0; i<n; ++i){
			hydrate(parent[i], directives);
		}
	}else{
		
		for(var selector in directives){
			if( typeof parent.querySelectorAll !== "function" ){
				continue;
			}
			var elements = parent.querySelectorAll(selector);
			var directive = directives[selector];
			var m = elements.length;
			for(var j=0; j<m; ++j){
				var el = elements[j];
				append(el, directive, el, bind);
			}
			if( typeof parent.matches === "function" && parent.matches(selector) ){
				append(parent, directive, parent, bind);
			}
		}
	}
}

function hydrateThis(directives){
	hydrate(this, directives);
	return this;
}

$.hydrate = hydrate;
$.fn.hydrate = hydrateThis;

})($);

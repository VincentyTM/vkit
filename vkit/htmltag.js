(function($, document){

var append = $.append;
var bind = $.bind;

function createHTMLTag(tagName){
	return function(){
		var el = document.createElement(tagName);
		append(el, arguments, el, bind);
		return el;
	};
}

$.htmlTag = createHTMLTag;

if( typeof Proxy === "function" ){
	$.htmlTags = new Proxy({}, {
		get: function(target, prop, receiver){
			return createHTMLTag(prop.toLowerCase().replace(/_/g, "-"));
		}
	});
}

})($, document);

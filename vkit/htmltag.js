(function($){

var append = $.append;
var setProps = $.setProps;

function createHTMLTag(tagName){
	return function(){
		var el = document.createElement(tagName);
		append(el, arguments, el, setProps);
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

})($);

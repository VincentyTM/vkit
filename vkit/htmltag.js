(function($){

var setProps = $.setProps;
var append = $.append;

function htmlTag(tagName){
	return function(){
		var el = document.createElement(tagName);
		append(el, arguments, setProps);
		return el;
	};
}

$.htmlTag = htmlTag;

if( typeof Proxy === "function" ){
	$.htmlTags = new Proxy({}, {
		get: function(target, prop, receiver){
			return $.htmlTag(prop.toLowerCase());
		}
	});
}

})($);

(function($){

var htmlTag = $.htmlTag;

$.htmlTags = new Proxy({}, {
	get: function(_target, tagName, _receiver){
		return htmlTag(tagName.toLowerCase().replace(/_/g, "-"));
	}
});

})($);

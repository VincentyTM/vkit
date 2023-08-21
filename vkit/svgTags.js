(function($){

var svgTag = $.svgTag;

$.svgTags = new Proxy({}, {
	get: function(_target, tagName, _receiver){
		return svgTag(tagName.toLowerCase().replace(/_/g, "-"));
	}
});

})($);

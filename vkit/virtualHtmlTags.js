(function($) {

var virtualHtmlTag = $.virtualHtmlTag;

var virtualHtmlTags = new Proxy({}, {
	get: function(target, prop, receiver) {
		return virtualHtmlTag(prop.toLowerCase().replace(/_/g, "-"));
	}
});

$.virtualHtmlTags = virtualHtmlTags;

})($);

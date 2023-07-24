(function($){

function createVirtualHtmlTag(nodeName){
	return function(){
		return {
			arguments: arguments,
			isVirtual: true,
			nodeName: nodeName.toUpperCase()
		};
	};
}

var virtualHtmlTags = new Proxy({}, {
	get: function(target, prop, receiver){
		return createVirtualHtmlTag(prop.toLowerCase().replace(/_/g, "-"));
	}
});

$.virtualHtmlTag = createVirtualHtmlTag;
$.virtualHtmlTags = virtualHtmlTags;

})($);

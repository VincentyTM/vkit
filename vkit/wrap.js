(function($) {

var htmlTag = $.htmlTag;
var nodeRange = $.nodeRange;
var view = $.view;

function wrap(getWrapper, contents) {
	var range = nodeRange();
	
	function getView(wrapper) {
		if (typeof wrapper === "function") {
			return wrapper(range);
		}
		
		if (typeof wrapper === "string") {
			return htmlTag(wrapper)(range);
		}
		
		return [range.start, contents, range.end];
	}
	
	return getWrapper.view ? getWrapper.view(getView) : view(getWrapper, getView);
}

function wrapper(getWrapper) {
	return function() {
		return wrap(getWrapper, arguments);
	};
}

$.wrap = wrap;
$.wrapper = wrapper;

})($);

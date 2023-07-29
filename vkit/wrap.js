(function($){

var createNodeRange = $.nodeRange;
var view = $.view;
var htmlTag = $.htmlTag;

function wrap(getWrapper, contents){
	var range = createNodeRange();
	
	function getView(wrapper){
		if( typeof wrapper === "function" ){
			return wrapper(range);
		}
		
		if( typeof wrapper === "string" ){
			return htmlTag(wrapper)(range);
		}
		
		return [range.start, contents, range.end];
	}
	
	return getWrapper.view ? getWrapper.view(getView) : view(getWrapper, getView);
}

function createWrapper(getWrapper){
	return function(){
		return wrap(getWrapper, arguments);
	};
}

function wrapThis(getWrapper){
	return wrap(getWrapper, this);
}

$.wrapper = createWrapper;
$.wrap = wrap;
$.fn.wrap = wrapThis;

})($);

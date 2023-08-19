(function($){

var createNodeRange = $.nodeRange;
var htmlTag = $.htmlTag;
var view = $.view;

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

$.wrap = wrap;
$.wrapper = createWrapper;

})($);

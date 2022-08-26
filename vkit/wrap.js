(function($){

var view = $.view;
var htmlTag = $.htmlTag;

function wrap(getWrapper, contents){
	function getView(wrapper){
		if( typeof wrapper === "function" ){
			return wrapper.apply(null, contents);
		}
		if( typeof wrapper === "string" ){
			return htmlTag(wrapper)(contents);
		}
		return contents;
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

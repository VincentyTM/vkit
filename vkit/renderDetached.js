(function($){

var append = $.append;
var bind = $.bind;
var render = $.render;
var createComponent = $.component;
var getComponent = $.getComponent;
var setComponent = $.setComponent;

function renderDetached(getView, parent){
	var prev = getComponent(true);
	try{
		var component = createComponent(null);
		setComponent(component);
		if( parent ){
			var doc = parent.ownerDocument;
			if( doc ){
				component.window = doc.defaultView || doc.parentWindow;
			}
		}
		var view = getView(function(){
			component.unmount();
		});
		if( parent ){
			append(parent, view, parent, bind);
		}
		render();
		return view;
	}finally{
		setComponent(prev);
	}
}

function renderDetachedToThis(getView){
	renderDetached(getView, this[0]);
	return this;
}

$.renderDetached = renderDetached;
$.fn.renderDetached = renderDetachedToThis;

})($);

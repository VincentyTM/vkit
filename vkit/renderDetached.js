(function($){

var append = $.append;
var bind = $.bind;
var createComponent = $.component;
var getComponent = $.getComponent;
var inject = $.inject;
var provide = $.provide;
var setComponent = $.setComponent;
var update = $.update;
var WindowService = $.windowService;

function renderDetached(getView, parent){
	var prev = getComponent(true);
	try{
		var component = createComponent(null);
		setComponent(component);
		var win = null;
		if( parent ){
			var doc = parent.ownerDocument;
			if( doc ){
				win = doc.defaultView || doc.parentWindow;
			}
		}
		var view;
		provide([WindowService], function(){
			if( win ){
				inject(WindowService).window = win;
			}
			view = getView(function(){
				component.unmount();
			}, component);
			if( parent ){
				append(parent, view, parent, bind);
			}
		});
		update();
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

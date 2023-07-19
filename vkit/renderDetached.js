(function($){

var append = $.append;
var bind = $.bind;
var createComponent = $.component;
var emitUnmount = $.emitUnmount;
var inject = $.inject;
var provide = $.provide;
var update = $.update;
var WindowService = $.windowService;

function renderDetached(getView, parent){
	var component = createComponent(function(){
		provide(null, function(){
			var win = null;
			
			if( parent ){
				var doc = parent.ownerDocument;
				
				if( doc ){
					win = doc.defaultView || doc.parentWindow;
				}
			}
			
			if( win ){
				inject(WindowService).window = win;
			}
			
			var view = getView(function(){
				emitUnmount(component);
			}, component);
			
			if( parent ){
				append(parent, view, parent, bind);
			}
		});
	}, null, null);
	
	component.render();
	update();
	
	return component;
}

function renderDetachedToThis(getView){
	return renderDetached(getView, this[0]);
}

$.renderDetached = renderDetached;
$.fn.renderDetached = renderDetachedToThis;

})($);

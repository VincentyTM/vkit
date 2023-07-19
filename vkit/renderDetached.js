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
	if(!parent){
		parent = this[0];
	}
	
	var component = createComponent(function(){
		var win = null;
		var doc = parent.ownerDocument;
		
		if( doc ){
			win = doc.defaultView || doc.parentWindow;
		}
		
		provide(null, function(){
			if( win ){
				inject(WindowService).window = win;
			}
			
			var view = getView(function(){
				emitUnmount(component);
			}, component);
			
			append(parent, view, parent, bind);
		});
	}, null, null);
	
	component.render();
	update();
	
	return component;
}

$.renderDetached = renderDetached;
$.fn.renderDetached = renderDetached;

})($);

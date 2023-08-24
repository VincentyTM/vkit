(function($){

var append = $.append;
var bind = $.bind;
var createComponent = $.component;
var createProvider = $.provider;
var emitUnmount = $.emitUnmount;
var inject = $.inject;
var update = $.update;
var WindowService = $.windowService;

function renderDetached(getView, parent){
	var provider = createProvider(null, null);
	var component = createComponent(function(){
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
	}, null, provider);
	
	provider.component = component;
	component.render();
	update();
	
	return component;
}

$.renderDetached = renderDetached;

})($);

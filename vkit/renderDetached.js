(function($) {

var append = $.append;
var bind = $.bind;
var createComponent = $.createComponent;
var createInjector = $.createInjector;
var createProvider = $.provider;
var emitUnmount = $.emitUnmount;
var getValueFromClass = $.getValueFromClass;
var inject = $.inject;
var update = $.update;
var WindowService = $.windowService;

function renderDetached(getView, parent) {
	var injector = createInjector(null, function(token) {
		var provider = createProvider(getValueFromClass, token, component);
		injector.container.set(token, provider);
		return provider.getInstance();
	});
	
	var component = createComponent(function() {
		var win = null;
		
		if (parent) {
			var doc = parent.ownerDocument;
			if (doc) {
				win = doc.defaultView || doc.parentWindow;
			}
		}
		
		if (win) {
			inject(WindowService).window = win;
		}
		
		var view = getView(function() {
			emitUnmount(component);
		}, component);
		
		if (parent) {
			append(parent, view, parent, bind);
		}
	}, null, injector);
	
	component.render();
	update();
	
	return component;
}

$.renderDetached = renderDetached;

})($);

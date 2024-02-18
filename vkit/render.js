(function($) {

var append = $.append;
var bind = $.bind;
var rootComponent = $.rootComponent;
var rootInjector = $.rootInjector;
var setComponent = $.setComponent;
var setInjector = $.setInjector;
var update = $.update;

function render(getView, container) {
	try {
		setComponent(rootComponent);
		setInjector(rootInjector);
		append(container, getView(), container, bind);
	} finally {
		setComponent(null);
		setInjector(null);
	}
	
	update();
	
	return rootComponent;
}

$.render = render;

})($);

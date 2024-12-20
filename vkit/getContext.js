(function($) {

var getComponent = $.getComponent;
var getInjector = $.getInjector;
var setComponent = $.setComponent;
var setInjector = $.setInjector;
var throwError = $.throwError;

function getContext() {
	var component = getComponent();
	var injector = getInjector();
	
	return function(getView) {
		var prevComponent = getComponent(true);
		var prevInjector = getInjector(true);
		
		try {
			setComponent(component);
			setInjector(injector);
			
			return getView.apply(this, arguments);
		} catch (error) {
			throwError(error, component);
		} finally {
			setComponent(prevComponent);
			setInjector(prevInjector);
		}
	};
}

$.getContext = getContext;

})($);

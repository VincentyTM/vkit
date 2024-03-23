(function($) {

var createComponent = $.createComponent;
var createInjector = $.createInjector;
var createProvider = $.provider;

function mount() {
	throw new Error("The root component cannot be rerendered");
}

function getValueFromClass(config) {
    return new config();
}

var rootInjector = createInjector(null, function(token) {
	var provider = createProvider(getValueFromClass, token, rootComponent);
	rootInjector.container.set(token, provider);
	return provider.getInstance();
});

var rootComponent = createComponent(mount, null, rootInjector);

$.getValueFromClass = getValueFromClass;
$.rootComponent = rootComponent;
$.rootInjector = rootInjector;

})($);

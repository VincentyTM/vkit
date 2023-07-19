(function($){

var createComponent = $.component;
var createProvider = $.createProvider;
var rootComponent = $.rootComponent;

var rootProvider = createProvider(null, null);

var rootComponent = createComponent(function(){
	throw new Error("The root component cannot be rerendered");
}, null, rootProvider);

rootProvider.component = rootComponent;

$.rootComponent = rootComponent;
$.rootProvider = rootProvider;

})($);

(function($){

var component = $.component;
var provider = $.provider;

function mount(){
	throw new Error("The root component cannot be rerendered");
}

var rootProvider = provider(null, null);
var rootComponent = component(mount, null, rootProvider);

rootProvider.component = rootComponent;

$.rootComponent = rootComponent;
$.rootProvider = rootProvider;

})($);

(function($){

var createComponent = $.component;

$.rootComponent = createComponent(function(){
	throw new Error("The root component cannot be rerendered");
}, null, null);

})($);

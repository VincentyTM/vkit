(function($){

var getComponent = $.getComponent;
var rootComponent = $.rootComponent;

function noop(){}

function unmount(callback){
	var currentComponent = getComponent();
	return typeof callback === "function"
		? (currentComponent !== rootComponent ? currentComponent.onDestroy(callback) : noop)
		: currentComponent.onDestroy;
}

$.unmount = unmount;

})($);

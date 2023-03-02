(function($){

var getComponent = $.getComponent;
var rootComponent = $.rootComponent;

function noop(){}

function unmount(callback){
	var currentComponent = getComponent();
	return currentComponent !== rootComponent ? currentComponent.onDestroy.subscribe(callback) : noop;
}

$.unmount = unmount;

})($);

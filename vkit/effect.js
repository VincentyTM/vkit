(function($) {

var createComponent = $.createComponent;

function effect(callback) {
	createComponent(callback).render();
}

$.effect = effect;

})($);

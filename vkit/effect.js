(function($){

var component = $.component;

function effect(callback){
	component(callback).render();
}

$.effect = effect;

})($);

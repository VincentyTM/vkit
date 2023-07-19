(function($){

var createComponent = $.component;

function createEffect(callback){
	createComponent(callback).render();
}

$.effect = createEffect;

})($);

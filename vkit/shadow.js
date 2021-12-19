(function($){

var append = $.append;

function createShadow(){
	var args = arguments;
	return function(el){
		var shadow = el.attachShadow({mode: "open"});
		append(shadow, args);
	};
}

$.shadow = createShadow;

})($);

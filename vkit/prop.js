(function($){

var effect = $.effect;

function prop(name, getValue){
	return function(element){
		effect(function(){
			element[name] = getValue();
		});
	};
}

$.prop = prop;

})($);

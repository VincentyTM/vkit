(function($){

var createComponent = $.component;

function createDynamicProp(key, getValue){
	return function(node){
		createComponent(setValue).render();
		
		function setValue(){
			node[key] = getValue();
		}
	};
}

$.prop = createDynamicProp;

})($);

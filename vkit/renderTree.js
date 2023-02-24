(function($){

var bind = $.bind;
var append = $.append;
var render = $.render;
var rootComponent = $.rootComponent;
var setCurrentComponent = $.setCurrentComponent;

function renderTree(component){
	try{
		setCurrentComponent(rootComponent);
		var view = component();
		var parent = this[0];
		append(parent, view, parent, bind);
		render();
	}finally{
		setCurrentComponent(null);
	}
}

$.fn.render = renderTree;

})($);

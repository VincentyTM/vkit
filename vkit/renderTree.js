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
		if( parent ){
			append(parent, view, parent, bind);
		}
		render();
		return view;
	}finally{
		setCurrentComponent(null);
	}
}

$.fn.render = renderTree;

})($);

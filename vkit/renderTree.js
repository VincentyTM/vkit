(function($){

var bind = $.bind;
var append = $.append;
var render = $.render;
var rootComponent = $.rootComponent;
var setComponent = $.setComponent;

function renderTree(component){
	try{
		setComponent(rootComponent);
		var view = component();
		var parent = this[0];
		if( parent ){
			append(parent, view, parent, bind);
		}
		render();
		return view;
	}finally{
		setComponent(null);
	}
}

$.fn.render = renderTree;

})($);

(function($){

var append = $.append;
var bind = $.bind;
var rootComponent = $.rootComponent;
var setComponent = $.setComponent;
var update = $.update;

function render(getView, container){
	if(!container){
		container = this[0];
	}
	
	try{
		setComponent(rootComponent);
		var view = getView();
		append(container, view, container, bind);
		update();
	}finally{
		setComponent(null);
	}
	
	return rootComponent;
}

$.fn.render = render;

})($);

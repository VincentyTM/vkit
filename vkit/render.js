(function($){

var append = $.append;
var bind = $.bind;
var rootComponent = $.rootComponent;
var setComponent = $.setComponent;
var update = $.update;

function render(component){
	try{
		setComponent(rootComponent);
		var view = component();
		var parent = this[0];
		if( parent ){
			append(parent, view, parent, bind);
		}
		update();
		return view;
	}finally{
		setComponent(null);
	}
}

$.fn.render = render;

})($);

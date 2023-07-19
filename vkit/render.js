(function($){

var append = $.append;
var bind = $.bind;
var provide = $.provide;
var rootComponent = $.rootComponent;
var setComponent = $.setComponent;
var update = $.update;

function render(getView, container){
	if(!container){
		container = this[0];
	}
	
	try{
		setComponent(rootComponent);
		
		provide(null, function(){
			var view = getView();
			append(container, view, container, bind);
		});
	}finally{
		setComponent(null);
	}
	
	update();
	
	return rootComponent;
}

$.fn.render = render;

})($);

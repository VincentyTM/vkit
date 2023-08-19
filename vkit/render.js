(function($){

var append = $.append;
var bind = $.bind;
var rootComponent = $.rootComponent;
var rootProvider = $.rootProvider;
var setComponent = $.setComponent;
var setProvider = $.setProvider;
var update = $.update;

function render(getView, container){
	try{
		setComponent(rootComponent);
		setProvider(rootProvider);
		
		var view = getView();
		
		append(container, view, container, bind);
	}finally{
		setComponent(null);
		setProvider(null);
	}
	
	update();
	
	return rootComponent;
}

$.render = render;

})($);

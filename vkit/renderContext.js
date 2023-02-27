(function($){

var render = $.render;
var createComponent = $.component;
var getComponent = $.getComponent;
var setComponent = $.setComponent;

function renderContext(getView){
	var prev = getComponent(true);
	try{
		var component = createComponent(null);
		setComponent(component);
		var view = getView(function(){
			component.unmount();
		});
		render();
		return view;
	}finally{
		setComponent(prev);
	}
}

$.renderContext = renderContext;

})($);

(function($){

var append = $.append;
var bind = $.bind;
var render = $.render;
var createComponent = $.component;
var getComponent = $.getComponent;
var setComponent = $.setComponent;

function renderContext(getView, parent){
	var prev = getComponent(true);
	try{
		var component = createComponent(null);
		setComponent(component);
		var view = getView(function(){
			component.unmount();
		});
		if( parent ){
			append(parent, view, parent, bind);
		}
		render();
		return view;
	}finally{
		setComponent(prev);
	}
}

$.renderContext = renderContext;

})($);

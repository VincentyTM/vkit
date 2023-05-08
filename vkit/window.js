(function($, window){

var getComponent = $.getComponent;

function getWindow(){
	for(var component = getComponent(); component; component = component.parent){
		if( component.window ){
			return component.window;
		}
	}
	return window;
}

$.window = getWindow;

})($, window);

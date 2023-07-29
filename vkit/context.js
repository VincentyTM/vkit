(function($){

var getComponent = $.getComponent;
var getProvider = $.getProvider;
var setComponent = $.setComponent;
var setProvider = $.setProvider;
var throwError = $.throwError;

function getContext(){
	var component = getComponent();
	var provider = getProvider();
	
	return function(getView){
		var prevComponent = getComponent(true);
		var prevProvider = getProvider(true);
		
		try{
			setComponent(component);
			setProvider(provider);
			
			return getView.apply(this, arguments);
		}catch(error){
			throwError(error, component);
		}finally{
			setComponent(prevComponent);
			setProvider(prevProvider);
		}
	};
}

$.context = getContext;

})($);
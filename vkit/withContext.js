(function($){

var getComponent = $.getComponent;
var getProvider = $.getProvider;
var setComponent = $.setComponent;
var setProvider = $.setProvider;

function withContext(getView){
	var component = getComponent();
	var provider = getProvider();
	
	return function(){
		var prevComponent = getComponent(true);
		var prevProvider = getProvider(true);
		
		try{
			setComponent(component);
			setProvider(provider);
			
			return getView.apply(this, arguments);
		}catch(ex){
			component.throwError(ex);
		}finally{
			setComponent(prevComponent);
			setProvider(prevProvider);
		}
	};
}

$.withContext = withContext;

})($);

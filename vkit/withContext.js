(function($, document){

var createComponent = $.component;
var rootComponent = createComponent(null);
var currentComponent = null;
var currentProvider = null;

function withContext(getView){
	var component = getComponent();
	var provider = currentProvider;
	return function(){
		var prevComponent = currentComponent;
		var prevProvider = currentProvider;
		try{
			currentComponent = component;
			currentProvider = provider;
			return getView.apply(this, arguments);
		}catch(ex){
			component.throwError(ex);
		}finally{
			currentComponent = prevComponent;
			currentProvider = prevProvider;
		}
	};
}

function contextGuard(allowNull){
	if(!allowNull && !currentComponent){
		throw new Error("This function can only be called synchronously from a component");
	}
}

function getComponent(allowNull){
	contextGuard(allowNull);
	return currentComponent;
}

function setComponent(component){
	currentComponent = component;
}

function getProvider(allowNull){
	contextGuard(allowNull);
	return currentProvider;
}

function setProvider(provider){
	currentProvider = provider;
}

$.withContext = withContext;
$.rootComponent = rootComponent;
$.getComponent = getComponent;
$.setComponent = setComponent;
$.getProvider = getProvider;
$.setProvider = setProvider;

})($, document);

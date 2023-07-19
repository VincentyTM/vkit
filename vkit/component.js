(function($, undefined){

var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var getProvider = $.getProvider;
var setComponent = $.setComponent;
var setProvider = $.setProvider;
var throwError = $.throwError;

function createComponent(mount, parent, provider){
	var component = {
		children: null,
		emitError: null,
		parent: parent === undefined ? getComponent() : parent,
		render: renderComponent,
		unmount: null
	};
	
	if( provider === undefined ){
		provider = getProvider();
	}
	
	function renderComponent(){
		var prevComponent = getComponent(true);
		var prevProvider = getProvider(true);
		
		try{
			setComponent(null);
			emitUnmount(component);
			setComponent(component);
			setProvider(provider);
			mount();
		}catch(error){
			throwError(error, component);
		}finally{
			setComponent(prevComponent);
			setProvider(prevProvider);
		}
	}
	
	return component;
}

$.component = createComponent;

})($);

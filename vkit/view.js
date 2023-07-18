(function($){

var createComponent = $.component;
var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var setComponent = $.setComponent;
var withContext = $.withContext;

function createView(getValue, getView, immutable, update){
	var prev = getComponent();
	
	try{
		var A = update ? getValue : getValue();
		var component = createComponent(prev, immutable);
		var range = component.range;
		
		setComponent(component);
		
		var view = getView ? getView(A) : A;
		
		var updateView = withContext(function(newValue){
			var B = update ? newValue : getValue();
			
			if( A === B ){
				return;
			}
			
			component.clearView();
			emitUnmount(component);
			component.appendView(getView ? getView(B) : B);
			A = B;
		});
		
		if( update ){
			update.subscribe(updateView);
		}else{
			throw new Error("View method is not available");
		}
		
		return [range.start, view, range.end];
	}finally{
		setComponent(prev);
	}
}

$.view = createView;

})($);

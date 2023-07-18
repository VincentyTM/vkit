(function($){

var createComponent = $.component;
var createNodeRange = $.nodeRange;
var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var insert = $.insert;
var setComponent = $.setComponent;
var withContext = $.withContext;

function createView(getValue, getView, immutable, update){
	var prev = getComponent();
	
	try{
		var A = update ? getValue : getValue();
		var component = createComponent(prev, immutable);
		var range = createNodeRange();
		
		setComponent(component);
		
		var view = getView ? getView(A) : A;
		
		var updateView = withContext(function(newValue){
			var B = update ? newValue : getValue();
			
			if( A === B ){
				return;
			}
			
			if( range.start.nextSibling ){
				range.clear();
			}
			
			emitUnmount(component);
			
			insert(
				getView ? getView(B) : B,
				range.end,
				range.end.parentNode
			);
			
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

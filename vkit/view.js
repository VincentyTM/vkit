(function($){

var createComponent = $.component;
var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var setComponent = $.setComponent;
var withContext = $.withContext;

function createView(getValue, getView, immutable, onRender){
	var prev = getComponent();
	var A = onRender ? getValue : getValue();
	var component = createComponent(prev, immutable);
	
	setComponent(component);
	
	try{
		var view = getView ? getView(A) : A;
		prev.children.push(component);
		
		(onRender || component).subscribe(withContext(function(newValue){
			var B = onRender ? newValue : getValue();
			
			if( A === B ){
				return;
			}
			
			component.clearView();
			emitUnmount(component);
			component.children.splice(0, component.children.length);
			component.appendView(getView ? getView(B) : B);
			A = B;
		}));
		
		return [component.start, view, component.end];
	}finally{
		setComponent(prev);
	}
}

$.view = createView;

})($);

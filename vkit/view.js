(function($){

var createComponent = $.component;
var createNodeRange = $.nodeRange;

function view(getView){
	var component = createComponent(mount);
	var currentView;
	var range = createNodeRange();
	var render = component.render;
	var signal = this;
	
	if(!(signal && typeof signal.get === "function" && typeof signal.subscribe === "function")){
		signal = null;
	}
	
	function mount(){
		currentView = getView(signal ? signal.get() : null);
		
		if( range.start.nextSibling ){
			range.clear();
			range.append(currentView);
		}
	}
	
	render();
	
	if( signal ){
		signal.subscribe(render);
	}
	
	return [
		range.start,
		currentView,
		range.end
	];
}

$.view = view;

})($);

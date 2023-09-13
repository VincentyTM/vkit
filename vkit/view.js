(function($){

var createComponent = $.component;
var createNodeRange = $.nodeRange;
var isSignal = $.isSignal;

function view(getView){
	var component = createComponent(mount);
	var currentView;
	var range = createNodeRange();
	var render = component.render;
	var signal = this;
	
	if (isSignal(signal)) {
		signal.subscribe(render);
	} else {
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
	
	return [
		range.start,
		currentView,
		range.end
	];
}

$.view = view;

})($);

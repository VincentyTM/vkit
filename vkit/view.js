(function($) {

var createComponent = $.createComponent;
var createNodeRange = $.nodeRange;
var enqueueUpdate = $.enqueueUpdate;
var isSignal = $.isSignal;

function view(getView) {
	var component = createComponent(mount);
	var range = createNodeRange(true);
	var render = component.render;
	var signal = this;
	
	if (isSignal(signal)) {
		signal.subscribe(render);
	} else {
		signal = null;
	}
	
	function mount() {
		var currentView = getView(signal ? signal.get() : null);
		
		if (range.start.nextSibling) {
			range.clear();
			range.append(currentView);
		}
	}
	
	enqueueUpdate(render);
	
	return [
		range.start,
		range.end
	];
}

$.view = view;

})($);

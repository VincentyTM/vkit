(function($, document){

var createState = $.state;
var createNodeRange = $.nodeRange;

function useAnchor(view){
	var currentAnchor = createState(document.createTextNode(""));
	var range = createNodeRange();
	
	currentAnchor.subscribe(function(anchor){
		range.insertBefore(anchor);
	});
	
	function bind(el){
		currentAnchor.set(el);
	}
	
	function create(){
		var anchor = document.createTextNode("");
		currentAnchor.set(anchor);
		return anchor;
	}
	
	function render(){
		return [range.start, view, range.end, currentAnchor.get()];
	}
	
	currentAnchor.bind = bind;
	currentAnchor.create = create;
	currentAnchor.render = render;
	
	return currentAnchor;
}

$.anchor = useAnchor;

})($, document);

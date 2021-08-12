(function($, undefined){

function deepInsertBefore(anchor, elements){
	if( elements === null || elements === undefined ){
		return;
	}
	if( typeof elements !== "object" ){
		anchor.parentNode.insertBefore(document.createTextNode(elements), anchor);
		return;
	}
	if( elements.nodeType ){
		anchor.parentNode.insertBefore(elements, anchor);
		return;
	}
	for(var i=0, n=elements.length; i<n; ++i){
		deepInsertBefore(anchor, elements[i]);
	}
}

$.fn.hydrate = function(map){
	for(var tagName in map){
		for(var i=this.length; i--;){
			var container = this[i];
			if(!container.getElementsByTagName){
				continue;
			}
			var elements = container.getElementsByTagName(tagName);
			for(var j=elements.length; j--;){
				var element = elements[j];
				deepInsertBefore(element, map[tagName]());
				element.parentNode.removeChild(element);
			}
		}
	}
	return this;
};

})($);

(function($, undefined){

function deepInsertBefore(anchor, elements){
	if( elements === null || elements === undefined ){
		return;
	}
	if( typeof elements !== "object" ){
		anchor.parentNode.insertBefore(document.createTextNode(elements), anchor);
		return;
	}
	var n = elements.length;
	if( n ){
		for(var i=0; i<n; ++i){
			deepInsertBefore(anchor, elements[i]);
		}
	}else if( n!==0 ){
		anchor.parentNode.insertBefore(elements, anchor);
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

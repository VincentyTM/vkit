(function($){

function deepInsertBefore(anchor, elements){
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
			if(!this[i].getElementsByTagName){
				continue;
			}
			var elements = this[i].getElementsByTagName(tagName);
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

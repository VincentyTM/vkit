(function($, undefined){

var append = $.append;

function hydrate(map){
	for(var tagName in map){
		for(var i=this.length; i--;){
			var container = this[i];
			if(!container.getElementsByTagName){
				continue;
			}
			var component = map[tagName];
			var elements = container.getElementsByTagName(tagName);
			for(var j=elements.length; j--;){
				var element = elements[j];
				append(element, component(element));
			}
			if( container.tagName === tagName.toUpperCase() ){
				append(container, component(container));
			}
		}
	}
	return this;
}

$.fn.hydrate = hydrate;

})($);

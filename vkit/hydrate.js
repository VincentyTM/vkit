(function($){

$.fn.hydrate = function(map){
	for(var tagName in map){
		for(var i=this.length; i--;){
			var elements = this[i].getElementsByTagName(tagName);
			for(var j=elements.length; j--;){
				var element = elements[j];
				var instance = map[tagName]();
				var n = instance.length;
				var parent = element.parentNode;
				if( n ){
					var k = n - 1, last = instance[k];
					parent.replaceChild(last, element);
					for(; k>=0; --k){
						parent.insertBefore(instance[k], last);
					}
				}else{
					parent.removeChild(element);
				}
			}
		}
	}
	return this;
};

})($);

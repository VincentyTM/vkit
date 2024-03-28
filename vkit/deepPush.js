(function($, document, undefined) {

var directive = $.directive;
var toArray = $.toArray;

function deepPush(array, item, context, bind, crossView) {
	if (item === null || item === undefined || item === false || item === true){
		return array;
	}
	
	if (typeof item.render === "function") {
		deepPush(array, item.render(), context, bind, crossView);
		return array;
	}
	
	if (typeof item === "function") {
		deepPush(array, directive(context, item), context, bind, crossView);
		return array;
	}
	
	if (typeof item !== "object") {
		array.push(document.createTextNode(item));
		return array;
	}
	
	if (item.nodeType) {
		array.push(item);
		return array;
	}
	
	if (typeof item.length === "number") {
		var n = item.length;
		var a = toArray(item);
		
		for (var i = 0; i < n; ++i) {
			deepPush(array, a[i], context, bind, crossView);
		}
		
		return array;
	}
	
	if (typeof item.next === "function") {
		var x;
		
		do {
			x = item.next();
			deepPush(array, x.value, context, bind, crossView);
		} while (!x.done);
		
		return array;
	}
	
	if (bind) {
		bind(context, item, !crossView);
		return array;
	}
	
	return array;
}

$.deepPush = deepPush;

})($, document);

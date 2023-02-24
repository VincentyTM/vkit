(function($){

var html = $.html;

function templateTag(strings){
	var n = strings.length;
	var a = new Array(2*n - 1);
	if( n > 0 ){
		a[0] = strings[0];
	}
	for(var i=1, j=1; i<n; ++i){
		var arg = arguments[i];
		a[j++] = typeof arg === "string" ? [arg] : arg;
		a[j++] = strings[i];
	}
	return html.apply(null, a);
}

$.htmlString = templateTag;

})($);

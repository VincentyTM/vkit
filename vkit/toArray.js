(function($){

function toArray(arrayLike){
	var n = arrayLike.length;
	var a = new Array(n);
	for(var i=0; i<n; ++i){
		a[i] = arrayLike[i];
	}
	return a;
}

$.toArray = toArray;

})($);

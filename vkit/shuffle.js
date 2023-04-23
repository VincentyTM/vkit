(function($){

function shuffle(a){
	var j, x;
	for(var i = a.length - 1; i > 0; --i){
		j = Math.random() * (i + 1) | 0;
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

$.shuffle = shuffle;

})($);

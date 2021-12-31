(function($){

function exponential(p, k){
	var x = (1 - p)/p;
	x*=x;
	return p === 0.5 ? k : (Math.pow(x, k) - 1)/(x - 1);
}

$.easing = {
	exponentialIn: function(p){ return exponential(p, 0.75); },
	exponentialOut: function(p){ return exponential(p, 0.25); },
	sineIn: function(p){ return 1 - Math.cos(p*Math.PI/2); },
	sineOut: function(p){ return Math.sin(p*Math.PI/2); },
	linear: function(p){ return p; },
	swing: function(p){ return (1 - Math.cos(p*Math.PI))/2; },
	jump: function(p){ return p<1 ? 0 : 1; }
};

})($);

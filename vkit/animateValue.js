(function($){

var animate = $.animate;
var update = $.update;

function animateValue(signal, duration, options){
	var easing = options ? options.easing : null;
	var blocking = options ? options.blocking : false;
	var animation = null;
	var lastT = 0;
	
	function set(value){
		if( animation ){
			if( blocking ){
				return;
			}
			
			animation.stop();
			animation = null;
		}
		
		var oldValue = signal.get();
		var currT = lastT;
		
		animation = animate(function(t){
			if( t < 1 ){
				lastT = t;
				
				if( easing ){
					t = easing(t);
				}
				
				signal.set(oldValue * (1 - t) + value * t);
			}else{
				lastT = 0;
				signal.set(value);
				animation = null;
			}
			
			update();
		}, duration * (1 - currT));
	}
	
	function add(value){
		set(signal.get() + value);
	}
	
	function apply(func){
		set(func(signal.get()));
	}
	
	return {
		set: set,
		add: add,
		apply: apply,
		value: signal
	};
}

$.animateValue = animateValue;

})($);

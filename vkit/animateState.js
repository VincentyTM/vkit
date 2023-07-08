(function($){

var animate = $.animate;
var update = $.update;

function animateState(state, duration, options){
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
		
		var oldValue = state.get();
		var currT = lastT;
		
		animation = animate(function(t){
			if( t < 1 ){
				lastT = t;
				
				if( easing ){
					t = easing(t);
				}
				
				state.set(oldValue * (1 - t) + value * t);
			}else{
				lastT = 0;
				state.set(value);
				animation = null;
			}
			
			update();
		}, duration * (1 - currT));
	}
	
	function add(value){
		set(state.get() + value);
	}
	
	function apply(func){
		set(func(state.get()));
	}
	
	return {
		set: set,
		add: add,
		apply: apply,
		state: state
	};
}

$.animateState = animateState;

})($);

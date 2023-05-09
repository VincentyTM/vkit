(function($){

var animate = $.animate;
var createState = $.state;
var render = $.render;
var unmount = $.unmount;

function animateTo(state, duration, options){
	var latest = +state.get();
	var start = latest;
	var end = latest;
	var currentState = createState(latest);
	var currentAnimation = null;
	var easing = options ? options.easing : null;
	
	function animationLoop(t){
		latest = start + (end - start) * (easing ? easing(t) : t);
		currentState.set(latest);
		if( t >= 1 ){
			currentAnimation = null;
			start = end = +state.get();
		}
		render();
	}
	
	state.subscribe(function(value){
		if( currentAnimation ){
			currentAnimation.stop();
		}
		start = latest;
		end = +value;
		currentAnimation = animate(animationLoop, duration * Math.abs(end - start));
	});
	
	unmount(function(){
		if( currentAnimation ){
			currentAnimation.stop();
		}
	});
	
	return currentState;
}

$.animateTo = animateTo;

})($);

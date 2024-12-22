(function($, global) {

var createObservable = $.observable;
var requestAnimationFrame = global.requestAnimationFrame || global.setTimeout;
var cancelAnimationFrame = global.cancelAnimationFrame || global.clearTimeout;
var performance = global.performance && global.performance.now ? global.performance : {
	now: function() { return new Date().getTime(); }
};

function animate(update, duration, timeSource) {
	if (!timeSource) {
		timeSource = performance;
	}
	
	var startTime = timeSource.now();
	var frame = 0;
	var lastUpdate = startTime;
	var onComplete = createObservable();
	var paused = true;
	
	function loop() {
		lastUpdate = timeSource.now();
		
		var dt = lastUpdate - startTime;
		if (dt < duration) {
			frame = requestAnimationFrame(loop, 16);
			update(dt/duration, dt, duration);
		} else {
			paused = true;
			update(1, duration, duration);
			onComplete();
		}
	}
	
	function stop() {
		cancelAnimationFrame(frame);
		paused = true;
	}
	
	function start() {
		startTime = timeSource.now();
		
		if (paused) {
			paused = false;
			requestAnimationFrame(loop, 16);
		}
	}
	
	function resume() {
		startTime += timeSource.now() - lastUpdate;
		
		if (paused) {
			paused = false;
			requestAnimationFrame(loop, 16);
		}
	}
	
	function toggle() {
		paused ? resume() : stop();
	}
	
	function isPaused() {
		return paused;
	}
	
	start();
	
	return {
		then: onComplete.subscribe,
		stop: stop,
		start: start,
		resume: resume,
		toggle: toggle,
		isPaused: isPaused
	};
}

$.animate = animate;

})($, this);

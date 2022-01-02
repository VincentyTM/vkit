(function($, window){

var unmount = $.unmount;
var createState = $.state;
var render = $.render;

function createMediaState(mediaQuery, win){
	if(!win) win = window;
	if(!win.matchMedia){
		return createState(false);
	}
	var matcher = win.matchMedia(mediaQuery);
	var state = createState(matcher.matches);
	function onChange(e){
		state.set(e.matches);
		render();
	}
	if( matcher.addEventListener ){
		matcher.addEventListener("change", onChange);
		unmount(function(){
			matcher.removeEventListener("change", onChange);
		});
	}else{
		matcher.addListener(onChange);
		unmount(function(){
			matcher.removeListener(onChange);
		});
	}
	return state;
}

$.mediaState = createMediaState;

})($, window);

(function($){

var createState = $.state;
var getWindow = $.window;
var unmount = $.unmount;
var update = $.update;

function createMediaQuery(mediaQuery, win){
	if(!win){
		win = getWindow();
	}
	
	if(!win.matchMedia){
		return createState(false);
	}
	
	var matcher = win.matchMedia(mediaQuery);
	var state = createState(matcher.matches);
	
	function onChange(e){
		state.set(e.matches);
		update();
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

$.mediaQuery = createMediaQuery;

})($);

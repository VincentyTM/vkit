(function($, document){

var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;

function createFullScreenState(doc){
	if(!doc){
		doc = document;
	}
	var state = createState();
	function updateState(){
		state.set(
			doc.fullscreenElement ||
			doc.mozFullScreenElement ||
			doc.webkitFullscreenElement ||
			doc.webkitCurrentFullScreenElement ||
			null
		);
	}
	updateState();
	state.subscribe(function(el){
		if( el ){
			el.requestFullscreen ? el.requestFullscreen() :
			el.mozRequestFullScreen ? el.mozRequestFullScreen() :
			el.webkitRequestFullscreen ? el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) :
			el.webkitEnterFullscreen ? el.webkitEnterFullscreen() :
			state.set(null);
		}else if(
			doc.fullscreenElement ||
			doc.mozFullScreenElement ||
			doc.webkitFullscreenElement ||
			doc.webkitCurrentFullScreenElement
		){
			doc.cancelFullScreen ? doc.cancelFullScreen() :
			doc.mozCancelFullScreen ? doc.mozCancelFullScreen() :
			doc.webkitCancelFullScreen ? doc.webkitCancelFullScreen() :
			doc.exitFullscreen ? doc.exitFullscreen() :
			doc.webkitExitFullscreen ? doc.webkitExitFullscreen() :
			null;
		}
	});
	unmount(onEvent(doc, "fullscreenchange", updateState));
	unmount(onEvent(doc, "webkitfullscreenchange", updateState));
	return state;
}

$.fullScreenState = createFullScreenState;

})($, document);

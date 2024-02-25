(function($) {

var getWindow = $.getWindow;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var signal = $.signal;

function createFullScreenState() {
	var doc = getWindow().document;
	var state = signal();
	
	function updateState() {
		state.set(
			doc.fullscreenElement ||
			doc.mozFullScreenElement ||
			doc.webkitFullscreenElement ||
			doc.webkitCurrentFullScreenElement ||
			null
		);
	}
	
	updateState();
	
	state.subscribe(function(el) {
		if (el) {
			el.requestFullscreen ? el.requestFullscreen() :
			el.mozRequestFullScreen ? el.mozRequestFullScreen() :
			el.webkitRequestFullscreen ? el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) :
			el.webkitEnterFullscreen ? el.webkitEnterFullscreen() :
			state.set(null);
		} else if (
			doc.fullscreenElement ||
			doc.mozFullScreenElement ||
			doc.webkitFullscreenElement ||
			doc.webkitCurrentFullScreenElement
		) {
			doc.cancelFullScreen ? doc.cancelFullScreen() :
			doc.mozCancelFullScreen ? doc.mozCancelFullScreen() :
			doc.webkitCancelFullScreen ? doc.webkitCancelFullScreen() :
			doc.exitFullscreen ? doc.exitFullscreen() :
			doc.webkitExitFullscreen ? doc.webkitExitFullscreen() :
			null;
		}
	});
	
	onUnmount(
		onEvent(
			doc,
			"onfullscreenchange" in doc ? "fullscreenchange" : "webkitfullscreenchange",
			updateState
		)
	);
	
	return state;
}

$.fullScreen = createFullScreenState;

})($);

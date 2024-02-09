(function($) {

var getUserMedia = $.userMedia;

function getDisplayMedia(options) {
	return getUserMedia(options, true);
}

$.displayMedia = getDisplayMedia;

})($);

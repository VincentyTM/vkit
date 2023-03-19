(function($, navigator){

var createState = $.state;
var render = $.render;

function getUserMedia(constraints, onError, nav, displayMedia){
	if(!nav){
		nav = navigator;
	}
	var state = createState(null);
	
	function setConstraints(constraints){
		var stream = state.get();
		if( stream ){
			stream.getTracks().forEach(function(track){
				track.stop();
			});
			state.set(null);
		}
		if( constraints ){
			if(!nav.mediaDevices){
				if( typeof onError === "function" ){
					onError(new Error("MediaDevices API is not supported"));
				}
				return;
			}
			(
				displayMedia
					? nav.mediaDevices.getDisplayMedia(constraints)
					: nav.mediaDevices.getUserMedia(constraints)
			).then(function(stream){
				state.set(stream);
				render(error);
			}, function(){
				if( typeof onError === "function" ){
					onError(error);
				}
				render();
			});
		}
	}
	
	if( constraints && typeof constraints.effect === "function" ){
		constraints.effect(setConstraints);
	}else{
		setConstraints(constraints);
	}
	
	return state.map();
}

function getDisplayMedia(options, onError, nav){
	return getUserMedia(options, onError, nav, true);
}

$.userMedia = getUserMedia;
$.displayMedia = getDisplayMedia;

})($, navigator);

(function($, navigator){

var createState = $.state;
var render = $.render;
var unmount = $.unmount;

function getUserMedia(constraints, onError, nav, displayMedia){
	if(!nav){
		nav = navigator;
	}
	var state = createState(null);
	var pending = createState(false);
	
	function setConstraints(constraints){
		var stream = state.get();
		if( stream ){
			stream.getTracks().forEach(function(track){
				track.stop();
			});
			state.set(null);
		}
		if( constraints ){
			if(
				!nav.mediaDevices ||
				(!displayMedia && typeof nav.mediaDevices.getUserMedia !== "function") ||
				(displayMedia && typeof nav.mediaDevices.getDisplayMedia !== "function")
			){
				if( typeof onError === "function" ){
					onError(new Error("MediaDevices API is not supported"));
				}
				return;
			}
			pending.set(true);
			(
				displayMedia
					? nav.mediaDevices.getDisplayMedia(constraints)
					: nav.mediaDevices.getUserMedia(constraints)
			).then(function(stream){
				state.set(stream);
				pending.set(false);
				render();
			}, function(error){
				pending.set(false);
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
	
	unmount(function(){
		setConstraints(null);
	});
	
	var userMedia = state.map();
	userMedia.pending = pending.map();
	return userMedia;
}

function getDisplayMedia(options, onError, nav){
	return getUserMedia(options, onError, nav, true);
}

$.userMedia = getUserMedia;
$.displayMedia = getDisplayMedia;

})($, navigator);

(function($, document, global){

var computed = $.computed;
var createAsyncState = $.asyncState;
var createObservable = $.observable;

var ImageCapture = global.ImageCapture || function(track){
	var onPlay = createObservable();
	var stream = new MediaStream([track]);
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	var video = document.createElement("video");
	video.muted = true;
	video.srcObject = stream;
	video.oncanplay = function(){
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		video.play();
	};
	video.onplay = onPlay;
	
	function takePhoto(resolve){
		ctx.drawImage(video, 0, 0);
		canvas.toBlob(function(blob){
			if( typeof Promise === "function" ){
				Promise.resolve(blob).then(resolve);
			}else{
				setTimeout(function(){
					resolve(blob);
				}, 0);
			}
		});
	}
	
	this.takePhoto = function(){
		var resolve = createObservable();
		
		if( video.paused ){
			onPlay.subscribe(function(){
				takePhoto(resolve);
			});
		}else{
			takePhoto(resolve);
		}
		
		return {
			then: function(onResolve){
				if( typeof onResolve === "function" ){
					resolve.subscribe(onResolve);
				}
			}
		};
	};
};

function getArgs(){
	return arguments;
}

function createImageCapture(stream, params, onError){
	var imageCapture = createAsyncState(
		stream,
		function(s){
			if(!s){
				return null;
			}
			
			var track = typeof s.getVideoTracks === "function" ? s.getVideoTracks()[0] : s;
			if(!track){
				throw new Error("No video track in stream");
			}
			
			return new ImageCapture(track);
		},
		onError,
		null
	);
	
	return createAsyncState(
		computed(getArgs, [imageCapture, params]),
		function(args){
			var ic = args[0];
			var ps = args[1];
			
			if(!ic || !ps){
				return null;
			}
			
			return ic.takePhoto(ps);
		},
		onError,
		null
	);
}

$.imageCapture = createImageCapture;

})($, document, this);

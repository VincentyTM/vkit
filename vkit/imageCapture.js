(function($, document, global){

var createAsyncState = $.asyncState;
var createObservable = $.observable;
var createState = $.state;
var map = $.fn.map;
var render = $.render;

var ImageCapture = global.ImageCapture || function(track){
	var onPlay = createObservable();
	var stream = new MediaStream([track]);
	var canvas = document.createElement("canvas");
	var video = document.createElement("video");
	video.muted = true;
	video.srcObject = stream;
	video.oncanplay = function(){
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		video.play();
	};
	video.onplay = onPlay;
	var ctx = canvas.getContext("2d");
	
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
			
			if( typeof ImageCapture !== "function" ){
				throw new Error("ImageCapture API is not supported");
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
		map.call([imageCapture, params], getArgs),
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

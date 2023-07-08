(function($, g, undefined){

var createObservable = $.observable;
var update = $.update;

var RTCSessionDescription = g.RTCSessionDescription || g.mozRTCSessionDescription || g.RTCSessionDescription;
var RTCPeerConnection = g.RTCPeerConnection || g.mozRTCPeerConnection || g.webkitRTCPeerConnection;
var RTCIceCandidate = g.RTCIceCandidate || g.mozRTCIceCandidate || g.RTCIceCandidate;

function defaultValue(option, value){
	return option === undefined ? value : option;
}

function createWebRTCPeer(params){
	var emitClose = createObservable();
	var emitError = createObservable();
	var emitMessage = createObservable();
	var emitSignal = createObservable();
	
	var bufferedAmountLowThreshold = defaultValue(params.bufferedAmountLowThreshold, 1024 * 128);
	var channelLabel = defaultValue(params.channelLabel, "channel");
	var channelOptions = defaultValue(params.channelOptions, {ordered: false});
	var maxBufferSize = defaultValue(params.maxBufferSize, 1024 * 256);
	var options = params.options;
	var polite = !!params.polite;
	var retryDelay = defaultValue(params.retryDelay, 8);
	
	var ignoreOffer = false;
	var makingOffer = false;
	var receiveChannel = null;
	var receiveChannelActive = false;
	var sendChannel;
	var streamRegs = [];
	
	var peer = {
		addStream: addStream,
		close: close,
		isConnected: false,
		onClose: emitClose.subscribe,
		onError: emitError.subscribe,
		onMessage: emitMessage.subscribe,
		onSignal: emitSignal.subscribe,
		receiveSignal: receiveSignal,
		removeStream: removeStream,
		restart: restart,
		send: send,
		streams: []
	};
	
	var pc = new RTCPeerConnection(options);
	
	pc.onicecandidate = function(e){
		emitSignal({
			"candidate": e.candidate
		});
		update();
	};
	
	pc.oniceconnectionstatechange = function(){
		peer.isConnected = pc.iceConnectionState === "connected";
		
		if( pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected" ){
			if(!polite){
				pc.restartIce();
			}
		}else if( pc.iceConnectionState === "connected" ){
			readdStreams();
		}
		
		updateStatus();
		update();
	};
	
	pc.onsignalingstatechange = function(){
		updateStatus();
		update();
	};
	
	pc.onnegotiationneeded = function(){
		makingOffer = true;
		
		pc.setLocalDescription().then(function(){
			emitSignal({
				"description": pc.localDescription
			});
			makingOffer = false;
			update();
		}, function(error){
			emitError(error);
			makingOffer = false;
			update();
		});
	};
	
	function removeRemoteStream(stream){
		var streams = peer.streams;
		
		for(var i=streams.length; i--;){
			if( streams[i] === stream ){
				peer.streams = streams.slice(0, i).concat(streams.slice(i + 1));
				break;
			}
		}
	}
	
	function addRemoteStream(stream){
		var streams = peer.streams;
		
		for(var i=streams.length; i--;){
			if( streams[i] === stream ){
				return;
			}
		}
		
		peer.streams = streams.concat([stream]);
		
		stream.onremovetrack = function(e){
			var tracks = stream.getTracks();
			
			for(var i=tracks.length; i--;){
				var track = tracks[i];
				
				if( track.readyState !== "ended" && !track.muted ){
					return;
				}
			}
			
			removeRemoteStream(stream);
			update();
		};
	}
	
	pc.ontrack = function(e){
		var n = e.streams.length;
		
		for(var i=0; i<n; ++i){
			addRemoteStream(e.streams[i]);
		}
		
		update();
	};
	
	pc.ondatachannel = function(e){
		if( receiveChannel ){
			receiveChannel.close();
			receiveChannel = null;
		}
		
		var rc = e.channel;
		rc.binaryType = "arraybuffer";
		
		rc.onerror = function(e){
			emitError(e);
		};
		
		rc.onopen = function(){
			if( receiveChannel ){
				return;
			}
			
			receiveChannel = rc;
			updateStatus();
			update();
		};
		
		rc.onclosing = function(){
			if( receiveChannel === rc ){
				receiveChannel = null;
				updateStatus();
				update();
			}
		};
		
		rc.onclose = function(){
			if( receiveChannel === rc ){
				receiveChannel = null;
				updateStatus();
				update();
			}
		};
		
		rc.onmessage = function(e){
			emitMessage(e.data, this.label);
			update();
		};
	};
	
	pc.onbufferedamountlow = function(){
		flush();
	};
	
	pc.bufferedAmountLowThreshold = bufferedAmountLowThreshold;
	
	var jsonQueue = [];
	var blobQueue = [];
	var sendTimeout = 0;
	
	function updateStatus(){
		if( sendChannel.readyState === "closed" && !receiveChannel && pc.iceConnectionState === "closed" ){
			emitClose();
		}
	}
	
	function send(message){
		var queue = message instanceof Blob || message instanceof ArrayBuffer || message instanceof Uint8Array ? blobQueue : jsonQueue;
		queue.push(message);
		clearTimeout(sendTimeout);
		sendTimeout = setTimeout(flush, retryDelay);
	}
	
	function flush(){
		clearTimeout(sendTimeout);
		sendTimeout = 0;
		
		while( jsonQueue.length > 0 ){
			if( sendChannel && sendChannel.readyState === "open" && sendChannel.bufferedAmount <= maxBufferSize ){
				sendChannel.send(jsonQueue[0]);
				jsonQueue.shift();
			}else{
				break;
			}
		}
		
		while( blobQueue.length > 0 ){
			if( sendChannel && sendChannel.readyState === "open" && sendChannel.bufferedAmount + blobQueue[0].byteLength <= maxBufferSize ){
				sendChannel.send(blobQueue[0]);
				blobQueue.shift();
			}else{
				break;
			}
		}
		
		if( jsonQueue.length > 0 || blobQueue.length > 0 ){
			sendTimeout = setTimeout(flush, retryDelay);
		}
	}
	
	function restart(){
		if( sendChannel && sendChannel.readyState !== "open" && sendChannel.readyState !== "connecting" ){
			sendChannel.close();
			sendChannel = null;
			createSendChannel(channelLabel, channelOptions);
		}
		
		if( receiveChannel && receiveChannel.readyState !== "open" && receiveChannel.readyState !== "connecting" ){
			receiveChannel.close();
			receiveChannel = null;
		}
	}
	
	function createSendChannel(label, options){
		if( sendChannel ){
			return;
		}
		
		var sc = pc.createDataChannel(label, options);
		sc.binaryType = "arraybuffer";
		
		sc.onerror = function(e){
			emitError(e);
			update();
		};
		
		sc.onopen = function(){
			updateStatus();
			flush();
			update();
		};
		
		sc.onclosing = function(){
			updateStatus();
			sendChannel = null;
			createSendChannel(label, options);
			update();
		};
		
		sc.onclose = function(){
			updateStatus();
			update();
		};
		
		sendChannel = sc;
	}
	
	function readdStreams(){
		var n = streamRegs.length;
		
		for(var i=0; i<n; ++i){
			var reg = streamRegs[i];
			reg.remove();
			reg.remove = addStreamRaw(reg.stream);
		}
	}
	
	function addStreamRaw(stream){
		var senders = [];
		
		stream.getTracks().forEach(function(track){
			try{
				var sender = pc.addTrack(track, stream);
				senders.push(sender);
				
				track.addEventListener("ended", function(){
					pc.removeTrack(sender);
				});
			}catch(ex){
			}
		});
		
		return function(){
			if( pc.signalingState !== "closed" ){
				var n = senders.length;
				
				for(var i=0; i<n; ++i){
					pc.removeTrack(senders[i]);
				}
			}
		};
	}
	
	function addStream(stream){
		for(var i=streamRegs.length; i--;){
			if( streamRegs[i].stream === stream ){
				return;
			}
		}
		
		var removeStreamRaw = addStreamRaw(stream);
		
		streamRegs.push({
			stream: stream,
			remove: removeStreamRaw
		});
	}
	
	function removeStream(stream){
		for(var i=streamRegs.length; i--;){
			var reg = streamRegs[i];
			
			if( reg.stream === stream ){
				reg.remove();
				streamRegs.splice(i, 1);
				break;
			}
		}
	}
	
	function setRemoteDescription(description){
		pc.setRemoteDescription(description).then(function(){
			if( description.type === "offer" ){
				pc.setLocalDescription().then(function(){
					emitSignal({
						"description": pc.localDescription
					});
					update();
				}, function(error){
					emitError(error);
					update();
				});
			}
		}, function(error){
			emitError(error);
			update();
		});
	}
	
	function receiveSignal(signal){
		var description = signal.description;
		
		if( description ){
			var offerCollision = description.type === "offer" && (makingOffer || pc.signalingState !== "stable");
			ignoreOffer = !polite && offerCollision;
			
			if( ignoreOffer ){
				return;
			}
			
			setRemoteDescription(description);
		}else if( "candidate" in signal && pc.remoteDescription ){
			pc.addIceCandidate(signal.candidate).then(null, function(error){
				if(!ignoreOffer){
					emitError(error);
					update();
				}
			});
		}
	}
	
	function close(){
		clearTimeout(sendTimeout);
		sendChannel.close();
		
		if( receiveChannel ){
			receiveChannel.close();
			receiveChannel = null;
		}
		
		if( pc.signalingState !== "closed" ){
			pc.close();
			emitClose();
		}
	}
	
	createSendChannel(channelLabel, channelOptions);
	
	return peer;
}

$.webRTCPeer = createWebRTCPeer;
$.webRTCPeer.isSupported = !!(RTCSessionDescription && RTCPeerConnection && RTCIceCandidate);

})($, this);
